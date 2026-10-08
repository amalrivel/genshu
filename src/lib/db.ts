import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForDb = globalThis as typeof globalThis & { genshuPrisma?: PrismaClient };

function createClient() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || DB_PASSWORD === undefined || !DB_DATABASE) {
    throw new Error("MariaDB configuration is incomplete");
  }
  const adapter = new PrismaMariaDb({
    host: DB_HOST, user: DB_USER, password: DB_PASSWORD,
    database: DB_DATABASE, port: Number(DB_PORT || 3306), connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

// NOTE: Hot reload preserves globalThis, including clients created before a
// new model was generated. Replace that stale client instead of reusing it.
const cachedClient = globalForDb.genshuPrisma;
const hasCurrentModels = cachedClient?.activityCategory !== undefined;
if (cachedClient && !hasCurrentModels) {
  void cachedClient.$disconnect().catch(() => {
    console.error("Could not close the outdated development database client.");
  });
}

export const prisma = hasCurrentModels ? cachedClient! : createClient();
if (process.env.NODE_ENV !== "production") globalForDb.genshuPrisma = prisma;
