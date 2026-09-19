# Genshu — Decisions

## 2026-09-19 — Local PostgreSQL for Current Development

**Decision:** Use PostgreSQL running locally as the database for the current development phase.

**Reason:** The project is still in MVP development, the expected initial user count is small, and a local database keeps the architecture simple while core product flows are still changing.

**Boundary:** This is a development-phase decision, not a permanent hosting commitment. A managed PostgreSQL provider may be selected later when deployment requirements are known.

**Rejected for now:** Supabase and other managed database platforms.

---

## 2026-09-19 — External Auth and Storage Deferred

**Decision:** Do not select an external authentication or file-storage provider yet.

**Reason:** The product requirements for accounts and image workflows are not finalized enough to justify provider coupling.

**Boundary:** Authentication and storage must still be designed securely when implemented. Deferring the provider choice does not mean deferring authorization requirements.

---

## 2026-09-17 — Bun

**Decision:** Use Bun as the package manager and primary local JavaScript tooling.

**Reason:** Keep dependency installation and project commands simple and fast.

**Boundary:** Bun-specific runtime APIs are not required by application code. Bun as tooling does not imply that production must run on the Bun runtime.

---

## 2026-09-17 — Single Next.js Application

**Decision:** Build Genshu as one full-stack Next.js App Router application.

**Reason:** The MVP does not require independent frontend and API services.

**Rejected:** Separate Vite frontend and Express API.

---

## 2026-09-17 — No ORM Initially

**Decision:** Do not introduce an ORM during the initial MVP foundation.

**Reason:** Database needs are still small enough to favor explicit server-side PostgreSQL access and avoid adding an abstraction before it provides clear value.

**Boundary:** Revisit this only if schema migration, type safety, or query complexity creates a concrete need.
