-- CreateTable: agents
CREATE TABLE "agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "apiKeyHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "agents_apiKeyHash_key" ON "agents"("apiKeyHash");

-- CreateTable: agent_files
CREATE TABLE "agent_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL DEFAULT 0,
    "storageKey" TEXT NOT NULL,
    "metadata" TEXT,
    "isIndexed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_files_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "agent_files_agentId_idx" ON "agent_files"("agentId");

-- CreateTable: embeddings
CREATE TABLE "embeddings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "fileId" TEXT,
    "content" TEXT NOT NULL,
    "vector" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "embeddings_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "embeddings_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "agent_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "embeddings_agentId_idx" ON "embeddings"("agentId");
CREATE INDEX "embeddings_fileId_idx" ON "embeddings"("fileId");

-- CreateTable: memories
CREATE TABLE "memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memories_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "memories_agentId_idx" ON "memories"("agentId");
