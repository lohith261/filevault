-- CreateTable
CREATE TABLE "anon_upload_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "anon_upload_logs_ip_createdAt_idx" ON "anon_upload_logs"("ip", "createdAt");
