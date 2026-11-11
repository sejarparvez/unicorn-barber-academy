// Prisma 7 does not auto-load .env files (and Bun does not auto-load them for
// node_modules/.bin executions), so load dotenv before env() is evaluated.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
