-- CreateEnum
CREATE TYPE "StarStatus" AS ENUM ('VALID', 'SUSPECT', 'REMOVED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "homeLimit" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Website" ADD COLUMN "stars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "starCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "note" TEXT,
ADD COLUMN "rankKey" TEXT,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WebsiteScreenshot" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "altText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteStar" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "status" "StarStatus" NOT NULL DEFAULT 'VALID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteStar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlugRedirect" (
    "id" TEXT NOT NULL,
    "oldSlug" TEXT NOT NULL,
    "newSlug" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlugRedirect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteScreenshot_websiteId_sortOrder_idx" ON "WebsiteScreenshot"("websiteId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteStar_websiteId_voterHash_key" ON "WebsiteStar"("websiteId", "voterHash");

-- CreateIndex
CREATE INDEX "WebsiteStar_websiteId_status_idx" ON "WebsiteStar"("websiteId", "status");

-- CreateIndex
CREATE INDEX "WebsiteStar_voterHash_idx" ON "WebsiteStar"("voterHash");

-- CreateIndex
CREATE UNIQUE INDEX "SlugRedirect_oldSlug_key" ON "SlugRedirect"("oldSlug");

-- CreateIndex
CREATE INDEX "SlugRedirect_oldSlug_idx" ON "SlugRedirect"("oldSlug");

-- CreateIndex
CREATE INDEX "SlugRedirect_websiteId_idx" ON "SlugRedirect"("websiteId");

-- CreateIndex
CREATE INDEX "Website_categoryId_rankKey_idx" ON "Website"("categoryId", "rankKey");

-- CreateIndex
CREATE INDEX "Website_categoryId_sortOrder_idx" ON "Website"("categoryId", "sortOrder");

-- AddForeignKey
ALTER TABLE "WebsiteScreenshot" ADD CONSTRAINT "WebsiteScreenshot_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteStar" ADD CONSTRAINT "WebsiteStar_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlugRedirect" ADD CONSTRAINT "SlugRedirect_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
