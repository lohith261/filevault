import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then .env as fallback
config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env["DATABASE_URL"];

// Warn at config-load time but don't throw — prisma generate doesn't need a
// live DB connection and throwing here crashes the Railway build step.
// Runtime validation happens in src/lib/prisma.ts.
if (url && !url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
  console.warn(
    `[prisma.config] WARNING: DATABASE_URL does not look like a PostgreSQL URL. Got: ${url.slice(0, 20)}...`
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(url ? { datasource: { url } } : {}),
});
