import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then .env as fallback
config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env["DATABASE_URL"];

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Set it to a PostgreSQL connection string, e.g. postgresql://user:pass@host:port/db"
  );
}

if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
  throw new Error(
    `DATABASE_URL must start with postgresql:// or postgres://. Got: ${url.slice(0, 20)}...`
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
