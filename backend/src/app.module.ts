import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExhibitionModule } from './exhibition/exhibition.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [PrismaModule, ExhibitionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
