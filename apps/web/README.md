# Genshu web

The Genshu browser application uses React Router, Vite, TypeScript, Tailwind CSS, and shadcn/Base UI primitives.

From the repository root, run `pnpm dev` and open `http://localhost:5173` or `http://127.0.0.1:5173`. During development, browser requests to `/api` are proxied to the API on port 3000 so HTTP-only session cookies remain same-origin.

Run `pnpm --filter web run typecheck` and `pnpm --filter web run build` to validate the frontend. Set `VITE_API_URL` only for deployments that need an explicit browser API origin.
