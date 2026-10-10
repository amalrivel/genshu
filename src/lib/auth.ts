import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  // NOTE: Email/password is enabled here, but the client import/adapter is stale.
  // TODO: Complete the supported PostgreSQL/auth integration, disable public signup,
  // and enforce managed account roles. See docs/developer-guide.md, Login and Data integration.
  emailAndPassword: { 
    enabled: true, 
  }, 
});
