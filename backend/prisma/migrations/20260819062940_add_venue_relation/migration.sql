-- CreateTable
CREATE TABLE "Venue" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(200),
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExhibitionVenue" (
    "exhibitionId" UUID NOT NULL,
    "venueId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExhibitionVenue_pkey" PRIMARY KEY ("exhibitionId","venueId")
);

-- CreateIndex
CREATE INDEX "Venue_name_idx" ON "Venue"("name");

-- CreateIndex
CREATE INDEX "ExhibitionVenue_venueId_idx" ON "ExhibitionVenue"("venueId");

-- AddForeignKey
ALTER TABLE "ExhibitionVenue" ADD CONSTRAINT "ExhibitionVenue_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExhibitionVenue" ADD CONSTRAINT "ExhibitionVenue_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
