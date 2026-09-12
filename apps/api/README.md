# Content API

Run `pnpm run dev` from the workspace root. The API uses `apps/api/.env` for
`DATABASE_URL` and listens on port 3000. The web UI is at
`http://localhost:5173/topics`; `VITE_API_URL` can override its default API URL.

| Method | Route | Body / behavior |
| --- | --- | --- |
| GET | /topics | Topics sorted by title, then ID |
| GET | /topics/:id | One topic |
| POST | /topics | `{ "title": "Road signs" }` |
| PUT | /topics/:id | `{ "title": "Updated title" }` |
| DELETE | /topics/:id | 409 if materials still reference the topic |
| GET | /materials | Materials sorted by title, then ID; optional `?topicId=1` |
| GET | /materials/:id | One material |
| POST | /materials | `{ "title": "Stop", "content": "# Stop", "topicId": 1 }` |
| PUT | /materials/:id | Required title/content; optional topicId to move material |
| DELETE | /materials/:id | Deletes only the specified material |
| GET | /questions | Questions sorted by Japanese text, then ID; optional `?topicId=1` |
| GET | /questions/:id | One question |
| POST | /questions | `{ "japaneseText": "…", "indonesianTranslation": "…", "furigana": "…", "correctAnswer": true, "japaneseExplanation": "…", "indonesianExplanation": "…", "topicId": 1 }` |
| PUT | /questions/:id | Required question fields; optional topicId to move the question |
| DELETE | /questions/:id | Deletes only the specified question; 409 while included in a practice set |
| GET | /practice-sets | Practice sets sorted by title, then ID |
| GET | /practice-sets/:id | One practice set with ordered questions |
| POST | /practice-sets | `{ "title": "Road signs", "description": "Optional", "questionIds": [2, 1] }` |
| PUT | /practice-sets/:id | Required title; optional description and `questionIds` replacement |
| PUT | /practice-sets/:id/questions | `{ "questionIds": [2, 1] }` replaces the selected questions and their order |
| DELETE | /practice-sets/:id | Deletes the set and its memberships |

Creates return 201, reads/updates 200, and deletes 204. Errors return
`{ "error": "message" }`: invalid input 400, missing record 404, foreign-key
conflict 409, oversized JSON 413, unexpected failure 500. IDs must be positive
PostgreSQL integers. Titles are trimmed; content must contain non-whitespace
text and is stored unchanged. JSON requests are limited to 1 MB.

This MVP has no authentication or authorization. Keep it in the local development
environment until access control is implemented.

## Checks

- `pnpm --filter api typecheck`
- `pnpm --filter api test` (requires the running API and development database;
  creates temporary records and cleans up only its own records)
- `pnpm --filter web typecheck`
- `pnpm --filter web build`

The Question and Practice Set migrations must be applied to the development
database before using the new endpoints.
