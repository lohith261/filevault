-- PostgreSQL baseline migration with pgvector support.
-- Run `npx prisma migrate deploy` to apply.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "passwordHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalSizeBytes" BIGINT NOT NULL DEFAULT 0,
    "entryFile" TEXT NOT NULL DEFAULT 'index.html',
    "storagePrefix" TEXT NOT NULL,
    "customDomain" TEXT,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "site_views" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_views_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "anon_upload_logs" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anon_upload_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "apiKeyHash" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_files" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL DEFAULT 0,
    "storageKey" TEXT NOT NULL,
    "metadata" TEXT,
    "isIndexed" BOOLEAN NOT NULL DEFAULT false,
    "indexStatus" TEXT NOT NULL DEFAULT 'not_indexed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_files_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "collection_files" (
    "collectionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_files_pkey" PRIMARY KEY ("collectionId","fileId")
);

CREATE TABLE "agent_shares" (
    "id" TEXT NOT NULL,
    "ownerAgentId" TEXT NOT NULL,
    "granteeAgentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_shares_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "embeddings" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "fileId" TEXT,
    "content" TEXT NOT NULL,
    "vector" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" vector(1536) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_states" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sites_slug_key" ON "sites"("slug");
CREATE UNIQUE INDEX "sites_customDomain_key" ON "sites"("customDomain");
CREATE INDEX "sites_userId_idx" ON "sites"("userId");
CREATE INDEX "sites_expiresAt_idx" ON "sites"("expiresAt");
CREATE INDEX "sites_createdAt_idx" ON "sites"("createdAt");
CREATE INDEX "site_files_siteId_idx" ON "site_files"("siteId");
CREATE UNIQUE INDEX "site_files_siteId_path_key" ON "site_files"("siteId", "path");
CREATE INDEX "site_views_siteId_idx" ON "site_views"("siteId");
CREATE INDEX "site_views_siteId_viewedAt_idx" ON "site_views"("siteId", "viewedAt");
CREATE INDEX "anon_upload_logs_ip_createdAt_idx" ON "anon_upload_logs"("ip", "createdAt");
CREATE UNIQUE INDEX "agents_apiKeyHash_key" ON "agents"("apiKeyHash");
CREATE INDEX "agent_files_agentId_idx" ON "agent_files"("agentId");
CREATE INDEX "collections_agentId_idx" ON "collections"("agentId");
CREATE INDEX "agent_shares_granteeAgentId_idx" ON "agent_shares"("granteeAgentId");
CREATE UNIQUE INDEX "agent_shares_ownerAgentId_granteeAgentId_key" ON "agent_shares"("ownerAgentId", "granteeAgentId");
CREATE INDEX "embeddings_agentId_idx" ON "embeddings"("agentId");
CREATE INDEX "embeddings_fileId_idx" ON "embeddings"("fileId");
CREATE INDEX "memories_agentId_idx" ON "memories"("agentId");
CREATE INDEX "agent_states_agentId_key_idx" ON "agent_states"("agentId", "key");

-- pgvector HNSW indexes for fast approximate nearest-neighbor search
CREATE INDEX "embeddings_vector_hnsw_idx" ON "embeddings" USING hnsw ("vector" vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX "memories_vector_hnsw_idx" ON "memories" USING hnsw ("vector" vector_cosine_ops) WITH (m = 16, ef_construction = 64);

ALTER TABLE "site_files" ADD CONSTRAINT "site_files_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_views" ADD CONSTRAINT "site_views_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_files" ADD CONSTRAINT "agent_files_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collections" ADD CONSTRAINT "collections_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection_files" ADD CONSTRAINT "collection_files_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection_files" ADD CONSTRAINT "collection_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "agent_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_shares" ADD CONSTRAINT "agent_shares_ownerAgentId_fkey" FOREIGN KEY ("ownerAgentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_shares" ADD CONSTRAINT "agent_shares_granteeAgentId_fkey" FOREIGN KEY ("granteeAgentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "agent_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memories" ADD CONSTRAINT "memories_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_states" ADD CONSTRAINT "agent_states_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
