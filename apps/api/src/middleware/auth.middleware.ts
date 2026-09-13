import type { NextFunction, Request, Response } from "express";
import { fail } from "../shared/errors.ts";
import { userFromRequest } from "../modules/auth/auth.service.ts";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const user = await userFromRequest(req);
    if (!user) fail(401, "Authentication is required.");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    next(Object.assign(new Error("Authentication is required."), { status: 401 }));
    return;
  }
  if (req.user.role !== "Admin") {
    next(Object.assign(new Error("Administrator access is required."), { status: 403 }));
    return;
  }
  next();
}
