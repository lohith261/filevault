-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "passwordHash" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalSizeBytes" BIGINT NOT NULL DEFAULT 0,
    "entryFile" TEXT NOT NULL DEFAULT 'index.html',
    "storagePrefix" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "site_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_files_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "site_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_views_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
