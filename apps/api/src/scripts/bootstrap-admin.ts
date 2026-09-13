import { hashPassword } from "../modules/auth/auth.service.ts";
import { db } from "../prisma/db.ts";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || null;
if (
  !email ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !password ||
  password.length < 12
) {
  throw new Error(
    "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters. ADMIN_NAME is optional.",
  );
}
const existing = await db.orm.public.User.where({ email }).first();
if (existing) {
  console.log(`Admin bootstrap skipped: ${email} already exists. No password was changed.`);
} else {
  await db.orm.public.User.create({
    email,
    name,
    role: "Admin",
    isActive: true,
    passwordHash: await hashPassword(password),
  });
  console.log(`Admin created: ${email}`);
}
await db.close();
