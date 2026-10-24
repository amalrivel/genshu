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
  trustedOrigins:
    process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : [],
  database: pool,
  emailAndPassword: { enabled: true, disableSignUp: true },
  // These mutations use Genshu's transactional account actions and history checks.
  disabledPaths: ["/admin/update-user", "/admin/set-role", "/admin/remove-user"],
  user: { modelName: "genshu_user" },
  session: { modelName: "genshu_session" },
  account: { modelName: "genshu_account" },
  verification: { modelName: "genshu_verification" },
  plugins: [
    admin({
      defaultRole: "student",
      adminRoles: ["admin"],
      roles: {
        student: defaultAc.newRole({}),
        teacher: defaultAc.newRole({}),
        admin: adminAc,
        user: userAc,
      },
    }),
  ],
});
