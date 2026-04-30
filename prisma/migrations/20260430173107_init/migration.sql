-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(6) NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "passwordHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalSizeBytes" BIGINT NOT NULL DEFAULT 0,
    "entryFile" TEXT NOT NULL DEFAULT 'index.html',
    "storagePrefix" TEXT NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_files" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_views" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sites_slug_key" ON "sites"("slug");

-- CreateIndex
CREATE INDEX "sites_userId_idx" ON "sites"("userId");

-- CreateIndex
CREATE INDEX "sites_expiresAt_idx" ON "sites"("expiresAt");

-- CreateIndex
CREATE INDEX "sites_createdAt_idx" ON "sites"("createdAt");

-- CreateIndex
CREATE INDEX "site_files_siteId_idx" ON "site_files"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "site_files_siteId_path_key" ON "site_files"("siteId", "path");

-- CreateIndex
CREATE INDEX "site_views_siteId_idx" ON "site_views"("siteId");

-- CreateIndex
CREATE INDEX "site_views_siteId_viewedAt_idx" ON "site_views"("siteId", "viewedAt");

-- AddForeignKey
ALTER TABLE "site_files" ADD CONSTRAINT "site_files_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_views" ADD CONSTRAINT "site_views_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
