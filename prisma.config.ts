import "dotenv/config";
import { defineConfig } from "prisma/config";

// NOTE: Reuse the existing MariaDB settings, rather than a PostgreSQL starter URL.
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;
if (!DB_HOST || !DB_USER || DB_PASSWORD === undefined || !DB_DATABASE) {
  throw new Error("MariaDB configuration is incomplete");
}
const url = `mysql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT || "3306"}/${encodeURIComponent(DB_DATABASE)}`;

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
    seed: "bun --conditions=react-server src/prisma/seed.ts",
  },
  datasource: { url },
});
