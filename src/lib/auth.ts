import "server-only";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { adminAc, defaultAc, userAc } from "better-auth/plugins/admin/access";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const auth = betterAuth({
  appName: "Genshu",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: pool,
  emailAndPassword: { enabled: true, disableSignUp: true },
  user: { modelName: "genshu_user" },
  session: { modelName: "genshu_session" },
  account: { modelName: "genshu_account" },
  verification: { modelName: "genshu_verification" },
  plugins: [
    admin({
      defaultRole: "student",
      adminRoles: ["admin"],
      roles: { student: defaultAc.newRole({}), teacher: defaultAc.newRole({}), admin: adminAc, user: userAc },
    }),
  ],
});
