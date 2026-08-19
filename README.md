# Enterprise Exhibition & Device Operations Platform

學習型企業展覽與設備管理平台。

目前採用 Modular Monolith，先使用 TypeScript 建立完整後端流程，再逐步加入 Venue、Device、Alarm、權限與即時更新。

## Exhibition 與 Venue 的資料關聯

一個 Exhibition 可以在多個 Venue 展出；一個 Venue 也可以在不同時間承接多個 Exhibition，因此兩者是多對多關係。

```text
Exhibition 1 ───< ExhibitionVenue >─── 1 Venue
```

`ExhibitionVenue` 是中介表。它不只是技術上的轉接，也可以保存「關聯本身」的資料，例如 `assignedAt`、展區或配置狀態。

目前資料模型：

```text
Exhibition
  id, name, startAt, endAt, status

Venue
  id, name, location, capacity

ExhibitionVenue
  exhibitionId, venueId, assignedAt
```

`ExhibitionVenue` 使用 `(exhibitionId, venueId)` 複合主鍵，避免同一個展覽被重複指派到同一個場館。兩個外鍵也讓 PostgreSQL 能阻止不存在的 Exhibition 或 Venue 被建立關聯。

## 專案結構

- `frontend/`：Next.js + TypeScript
- `backend/`：NestJS + TypeScript
- `compose.yaml`：目前只管理 PostgreSQL container
- `backend/prisma/schema.prisma`：資料模型來源
- `backend/prisma/migrations/`：資料庫 migration 歷史

## 目前後端架構

```text
HTTP Request
  ↓
ValidationPipe / DTO
  ↓
Controller：接收 HTTP
  ↓
Service：處理業務規則
  ↓
Repository：執行資料庫操作
  ↓
PrismaService：提供 Prisma Client
  ↓
PostgreSQL
```

目前 Exhibition 模組：

```text
backend/src/exhibition/
├── controllers/exhibition.controller.ts
├── services/exhibition.service.ts
├── repositories/exhibition.repository.ts
├── dto/create-exhibition.dto.ts
└── exhibition.module.ts
```

接下來會建立 `venue/` 模組與「指派展覽到場館」的 API；這會示範 Prisma relation query、外鍵錯誤處理，以及如何在 Service 保護業務規則。

## Port 與 Docker 網路

| Port | 位置 | 用途 |
|---:|---|---|
| `3000` | 本機 | Next.js frontend |
| `3101` | 本機 | NestJS backend |
| `55432` | 本機 | 連到 Docker PostgreSQL |
| `5432` | PostgreSQL container 內 | PostgreSQL 預設 port |
| `5555`（目前環境實際為 `5556`） | 本機 | Prisma Studio，啟動後使用 |

目前 Backend 與 Frontend 是直接在本機執行，只有 PostgreSQL 在 Docker 中。

```text
本機 NestJS :3101
本機 Next.js :3000
本機 localhost:55432
        ↓ port mapping
Docker PostgreSQL:5432
```

如果未來 Backend 也放進 Docker，Backend 會使用 Docker service name 連線：

```text
postgresql://exhibition:exhibition_dev@postgres:5432/exhibition
```

目前因為 Backend 在本機執行，所以使用：

```text
postgresql://exhibition:exhibition_dev@localhost:55432/exhibition
```

## 本地開發

在不同終端機執行：

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

- Frontend：`http://localhost:3000`
- Backend：`http://localhost:3101`
- Health API：`http://localhost:3101/api/health`

## 目前 API

```text
GET  /api/health
GET  /api/exhibitions
POST /api/exhibitions
GET  /api/exhibitions/:id
PATCH /api/exhibitions/:id
DELETE /api/exhibitions/:id
```

查看 Exhibition 列表：

```bash
curl http://localhost:3101/api/exhibitions
```

依照 status 篩選：

```bash
curl 'http://localhost:3101/api/exhibitions?status=DRAFT'
```

分頁查詢：

```bash
curl 'http://localhost:3101/api/exhibitions?page=1&pageSize=20'
```

關鍵字搜尋名稱與描述：

```bash
curl 'http://localhost:3101/api/exhibitions?keyword=科技&page=1&pageSize=20'
```

排序查詢：

```bash
curl 'http://localhost:3101/api/exhibitions?sortBy=name&sortOrder=asc'
```

目前允許的 `sortBy`：

```text
createdAt、name、startAt、endAt
```

目前允許的 `sortOrder`：

```text
asc、desc
```

分頁回應包含：

```text
items：目前頁面的資料
meta.page：目前頁碼
meta.pageSize：每頁筆數
meta.total：符合條件的總筆數
meta.totalPages：總頁數
```

## Docker / PostgreSQL 指令

以下指令請在專案根目錄執行：

```bash
# 啟動 PostgreSQL
docker compose up -d postgres

# 查看本專案 container 狀態
docker compose ps

# 查看 PostgreSQL logs
docker compose logs -f postgres

# 停止 PostgreSQL，但保留資料 volume
docker compose stop postgres

# 查看所有 Docker containers
docker ps
```

`compose.yaml` 目前定義一個 service：

```text
postgres service
└── postgres:16-alpine image
```

`exhibition-postgres-data` 是 named volume，用來保存 PostgreSQL 資料。即使 container 被移除，資料通常仍會保留。

```bash
# 進入 PostgreSQL 執行唯讀查詢
docker compose exec -T postgres \
  psql -U exhibition -d exhibition -c '\dt'

# 查看 Exhibition table 結構
docker compose exec -T postgres \
  psql -U exhibition -d exhibition -c '\d "Exhibition"'

# 查看資料
docker compose exec -T postgres \
  psql -U exhibition -d exhibition \
  -c 'SELECT * FROM "Exhibition";'
```

注意：

```bash
docker compose down
```

通常不會刪除 named volume；但：

```bash
docker compose down -v
```

會刪除 volume 與目前資料。除非確認要清空資料，否則不要使用。

## Prisma 指令

以下指令請在 `backend/` 執行，因為 Prisma CLI 與 `.env` 都在 Backend 專案內：

```bash
cd backend

# 查看 migration 狀態
npx prisma migrate status

# 修改 schema 後建立並套用 migration
npx prisma migrate dev --name <migration-name>

# 重新產生 Prisma Client
npx prisma generate

# 檢查 schema 語法與 relation 是否完整
npx prisma validate

# 開啟 Prisma Studio
npx prisma studio
```

Prisma Studio 預設會使用 `5555`；如果該 port 已被占用，會自動使用其他 port。本次啟動實際使用：

```text
http://localhost:5556
```

不要在 repository 根目錄直接執行 `npx prisma studio`，否則 npm 可能下載另一個 Prisma 版本，而且找不到 `backend/.env` 的 `DATABASE_URL`。

## Migration 流程

```text
修改 backend/prisma/schema.prisma
        ↓
npx prisma migrate dev --name 描述變更
        ↓
產生 backend/prisma/migrations/...
        ↓
執行 SQL 更新 PostgreSQL
        ↓
重新產生 Prisma Client
```

目前使用 Prisma 6，先避免 Prisma 7 新版 config 與 adapter 增加學習負擔。

## Git 與資料的關係

可以提交到 Git：

- `frontend/` 與 `backend/` 程式碼
- `compose.yaml`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `README.md`

不應提交：

- `.env`
- 密碼與 secrets
- `node_modules/`
- PostgreSQL volume 裡的實際資料

GitHub 儲存的是程式碼與設定，不是目前 Docker PostgreSQL 裡的資料。未來部署到雲端時，通常會使用雲端託管 PostgreSQL，資料不會放進 Git repository。

## 目前開發策略

開發階段：

```text
Frontend：本機執行
Backend：本機執行
PostgreSQL：Docker 執行
```

後續工程化階段才會加入：

```text
Frontend Docker image
Backend Docker image
Redis container
CI/CD
Cloud deployment
```

## NestJS 核心觀念

### 主要元件

```text
Module：組織與註冊元件
Controller：接收 HTTP request
Service / Provider：處理應用程式工作與商業規則
Repository：處理資料庫存取
DTO：描述 API 接收或回傳的資料格式
Pipe：轉換或驗證輸入資料
Guard：驗證是否允許執行，例如登入與權限
Interceptor：在 request / response 前後執行共用邏輯
Exception Filter：統一處理錯誤回應
```

### NestJS 啟動流程

```text
main.ts
  ↓ 建立 NestJS application
AppModule
  ↓ 讀取 imports、controllers、providers
NestJS Dependency Injection Container
  ↓ 建立物件與處理依賴
Controller / Service / Repository
  ↓
開始監聽 HTTP port
```

### Dependency Injection

如果 A 需要 B，代表 A 依賴 B：

```text
ExhibitionController
        ↓ 依賴
ExhibitionService
        ↓ 依賴
ExhibitionRepository
        ↓ 依賴
PrismaService
```

NestJS 會在 application 啟動時建立依賴：

```text
建立 PrismaService
  ↓
建立 ExhibitionRepository
  ↓
建立 ExhibitionService
  ↓
建立 ExhibitionController
```

`import` 只是讓 TypeScript 看得到 class；`@Injectable()` 表示 class 可以交給 NestJS 管理；`providers` 則是在 Module 中註冊這個 Provider。

### 每次 HTTP Request 的流程

```text
HTTP Request
  ↓
Middleware
  ↓
找到符合的 Controller route
  ↓
執行 @Body、@Query、@Param 對應的 Pipe
  ↓
ValidationPipe 驗證 DTO
  ↓ 驗證成功
Controller method
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
  ↓
Response
```

如果 DTO 格式錯誤：

```text
ValidationPipe
  ↓
直接回傳 400 Bad Request
```

這時 Controller method、Service 與 Repository 都不會執行。

如果格式正確但違反商業規則：

```text
Controller
  ↓
Service 發現規則不允許
  ↓
丟出 BadRequestException 或其他例外
  ↓
NestJS Exception Layer 統一回傳錯誤
```

### DTO、Entity 與資料庫

```text
CreateExhibitionDto
  ↓ API 輸入格式與 Validation
ExhibitionService
  ↓ 商業規則與資料轉換
ExhibitionRepository
  ↓ Prisma Client
PostgreSQL Exhibition table
```

同一個欄位可以存在於不同層，但用途不同：

```text
DTO：前端可以傳什麼
Entity / Prisma model：資料庫儲存什麼
Response DTO：前端可以看到什麼
```

例如 `status` 可以出現在 Response DTO，讓前端顯示 Draft 或 Published，但不應該讓前端在建立展覽時任意指定。

### DTO Validation 與 Business Rule

```text
name 必須是文字
startAt 必須是有效日期
  → DTO Validation

endAt 必須晚於 startAt
只有 Draft 才能發布
  → Service Business Rule
```

### `@Global()` Module

`@Global()` Module 在根 Module 載入後，其他 Module 可以使用它 export 的 Provider，而不必重複 import。

目前 PrismaModule 是 Global：

```text
AppModule
  ↓ 載入一次 PrismaModule
其他 Module 可以注入 PrismaService
```

Global 適合用於 Prisma、Config、Logger 等共用基礎設施；Exhibition、Device、Alarm 等業務 Module 不應全部設成 Global，避免依賴關係不清楚。

## Monorepo 策略

Monorepo 是指：

> 使用一個 Git repository 管理多個相關、但可以獨立運作的專案。

目前 repository 採用簡單 Monorepo：

```text
enterprise-exhibition-platform/
├── frontend/
├── backend/
├── compose.yaml
└── README.md
```

和 Multirepo 的差別是：

```text
Monorepo：一個 repository，裡面有 frontend 與 backend
Multirepo：frontend 一個 repository，backend 另一個 repository
```

這代表 Frontend 與 Backend 放在同一個 Git repository，但仍然是兩個獨立專案：

```text
Frontend：獨立 package.json、獨立啟動、獨立 build
Backend：獨立 package.json、獨立啟動、獨立 build
```

目前需要 Monorepo 的原因：

- 前後端 API 變更可以一起提交
- Docker Compose 與 README 集中管理
- 同一個功能的前端與後端修改容易一起檢查
- CI 可以在同一個 repository 驗證兩邊
- 學習時容易看到完整的 request 到畫面流程

目前不加入 Nx、Turborepo 或 pnpm workspace，因為它們不是現階段的主要學習目標。等未來有共用型別、共用 UI package 或需要平行執行多個 build，再評估工具化的 Monorepo。
