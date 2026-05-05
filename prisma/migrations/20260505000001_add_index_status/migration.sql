-- AlterTable
ALTER TABLE "agent_files" ADD COLUMN "indexStatus" TEXT NOT NULL DEFAULT 'not_indexed';

-- Update existing indexed files
UPDATE "agent_files" SET "indexStatus" = 'indexed' WHERE "isIndexed" = 1;
