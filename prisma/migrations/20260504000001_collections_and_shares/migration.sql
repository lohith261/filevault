CREATE TABLE "collections" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "agentId"   TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "collections_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "collections_agentId_idx" ON "collections"("agentId");

CREATE TABLE "collection_files" (
  "collectionId" TEXT NOT NULL,
  "fileId"       TEXT NOT NULL,
  "addedAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("collectionId", "fileId"),
  CONSTRAINT "collection_files_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "collection_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "agent_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "agent_shares" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "ownerAgentId"   TEXT NOT NULL,
  "granteeAgentId" TEXT NOT NULL,
  "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_shares_ownerAgentId_fkey" FOREIGN KEY ("ownerAgentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "agent_shares_granteeAgentId_fkey" FOREIGN KEY ("granteeAgentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "agent_shares_ownerAgentId_granteeAgentId_key" ON "agent_shares"("ownerAgentId", "granteeAgentId");
CREATE INDEX "agent_shares_granteeAgentId_idx" ON "agent_shares"("granteeAgentId");
