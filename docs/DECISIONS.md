## 2026-09-17 — Bun

**Decision:** Use Bun as the package manager and primary local JavaScript tooling.

**Reason:** Keep dependency installation and project commands simple and fast.

**Boundary:** Bun-specific runtime APIs are not required by application code.
Bun as tooling does not imply that production must run on the Bun runtime.

---

## 2026-09-17 — Single Next.js Application

**Decision:** Build Genshu as one full-stack Next.js App Router application.

**Reason:** The MVP does not require independent frontend and API services.

**Rejected:** Separate Vite frontend and Express API.

---

## 2026-09-17 — PostgreSQL and Supabase

**Decision:** Use Supabase for managed PostgreSQL, authentication, and initial file storage.

**Reason:** The product requires relational data, invited users, authentication,
and image storage while serving fewer than 30 initial participants.

Using one managed platform reduces operational complexity.

---

## 2026-09-17 — No ORM Initially

**Decision:** Do not introduce an ORM during the initial MVP foundation.

**Reason:** Current data-access requirements can be handled directly through
Supabase without another abstraction layer.

This decision may be revisited when query complexity demonstrates a concrete need.