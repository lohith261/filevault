-- Add userId to Agent (nullable — existing anonymous agents are unaffected)
ALTER TABLE "agents" ADD COLUMN "userId" TEXT;

-- Index for dashboard query: list all agents belonging to a Clerk user
CREATE INDEX idx_agents_userid ON "agents" ("userId") WHERE "userId" IS NOT NULL;
