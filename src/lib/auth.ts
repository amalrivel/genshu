import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  // TODO: Decide registration, login methods, roles, and password reset email.
  // No login method is enabled until those decisions are made.
  emailAndPassword: { 
    enabled: true, 
  }, 
});
