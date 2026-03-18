## TaskFlow repository coding standards

### Repo structure

- **Frontend**: `TaskFlow-API/` (Vite + React, ESM)
- **Backend**: `TaskFlow-Backend/` (Express + Mongoose, CommonJS)

### JavaScript style (observed)

- **Quotes**: use **single quotes** in JS/JSX.
- **Semicolons**: use semicolons consistently (backend); frontend is mixed—prefer adding semicolons for consistency.
- **Trailing commas**: allowed/encouraged in multiline objects/arrays where currently used.

### Backend (Express/Mongoose) rules

- **Route prefix**: all API endpoints live under `/api/*` from `TaskFlow-Backend/server.js`.
- **Auth**:
  - Protected routes must use `requireAuth` middleware early (`router.use(requireAuth)`).
  - Use `Authorization: Bearer <token>`; return `401` with `{ message }` when missing/invalid.
- **Response shape**:
  - Collections: `{ <nounPlural>: [...] }` (e.g. `{ projects }`, `{ tasks }`)
  - Single item: `{ <nounSingular>: {...} }` (e.g. `{ project }`, `{ task }`)
  - Errors: `{ message: string }` with an appropriate status code.
- **Validation**:
  - Validate required fields at route boundary; return `400` with `{ message }`.
  - For enums (e.g. `Task.PRIORITIES`), validate via a dedicated helper (like `validatePriority`).
- **Ownership checks**:
  - For nested resources, verify ownership via DB query and short-circuit with `404` when not found.
- **Notifications**:
  - When creating/updating/deleting entities, call `notificationService.*` after DB mutation.
  - Email failures must not fail the main request (log + continue).
- **Errors**:
  - Don’t swallow errors silently; log meaningful context.
  - Prefer a single global error handler; avoid duplicate route definitions.

### Frontend (Vite/React) rules

- **API base**: use `import.meta.env.VITE_API_BASE` with a localhost fallback.
- **Auth storage**:
  - Token key: `tf_token`
  - User key: `tf_user`
- **Networking**:
  - Use `fetch` with JSON requests.
  - Include `Authorization: Bearer ${token}` when authenticated.
- **Hooks**:
  - Avoid disabling `react-hooks/exhaustive-deps` unless you intentionally accept the trade-off; if disabled, keep it localized.

### Fix-now inconsistencies (action items)

- **Duplicate root route**: `TaskFlow-Backend/server.js` defines `app.get('/')` twice. Keep only one canonical `/` handler.
- **JWT secret defaults**: `requireAuth` has a dev default secret, but `auth.js` expects env values. Make these consistent (either enforce env everywhere or use the same safe dev fallback consistently).

