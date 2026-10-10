// NOTE: Current behavior: Prisma 8/PostgreSQL runtime; legacy callers are not wired here.
// TODO: Reconcile queries/auth/contracts/scripts before use; do not reset existing data.
// See docs/developer-guide.md, Data integration.

import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
