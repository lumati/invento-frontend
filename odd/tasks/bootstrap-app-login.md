# Bootstrap App + Login

Objective: bootstrap a React 19 + TypeScript + Material UI v9 admin frontend (theme per DESIGN.md / Kaiadmin Lite), wire it to the Laravel JWT backend, and deliver a working login flow (login → tokens → protected app shell → logout/refresh).

Branch: `feat/bootstrap-login` (opencode worktree).
Delivery: feature-branch, work-unit commits per task (T1/T2/T3), tests with each behavior.

## Specs

- S1: React + TypeScript + MUI v9 scaffold. Vite project ("invento-frontend"), directory structure: `src/theme/`, `src/api/`, `src/features/auth/`, `src/app/` (layout + routes), `src/types/`. `npm run dev` and `npm run build` work. API base URL from `VITE_API_URL` env (default `http://127.0.0.1:8000/api/v1`), documented in `.env.example`.
- S2: Default theme per `DESIGN.md` (Kaiadmin Lite): palette — primary `#1572E8`, primary-dark `#1269DB`, secondary `#6861CE`, error `#F25961`, warning `#FFAD46`, success `#31CE36`, info `#48ABF7`; background default `#F5F7FD`, paper `#FFFFFF`; text primary `#2A2F5B`, text secondary `#686F76`; UI font "Public Sans" weights 400/500/600 (Google Fonts); shape: card radius 10px, pill buttons 100px radius; card shadow `rgba(69,65,78,0.1) 2px 6px 15px`. Sidebar surface navy `#1A2035`.
- S3: Login page (MUI): email + password fields, submit button (primary pill), error messages from backend shown to user (invalid credentials / inactive user), loading state with disabled controls. Calls `POST /authentication/login` with `{ "email": ..., "password": ... }`. On success stores `access_token`, `refresh_token`, `user` and navigates to the protected app. Unauthenticated users are redirected to login. Example success body (verbatim from backend controller docs):
  ```json
  {
      "success": true,
      "message": "Login exitoso",
      "data": {
          "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
          "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
          "token_type": "Bearer",
          "expires_in": 900,
          "user": { "id": 1, "username": "johndoe", "email": "user@example.com" }
      }
  }
  ```
- S4: API client: single axios instance (base URL `VITE_API_URL`). Request interceptor attaches `Authorization: Bearer <access_token>`. On `401` response it tries `POST /authentication/refresh` with `{ "refresh_token": ... }`; on success retries the original request with the new `access_token` and stores rotated tokens; on refresh failure clears the session and redirects to login. Refresh/logout endpoints: `POST /authentication/refresh`, `POST /authentication/logout` (both take `{ "refresh_token": ... }`).
- S5: Auth state: shared session store (React Context) exposing `user`, `isAuthenticated`, `login(email, password)`, `logout()`. Tokens persisted in `localStorage` (key namespace `invento.auth.*`). Logout calls backend logout, then clears local state.
- S6: App shell: fixed left sidebar (~265px, navy `#1A2035`, white text, uppercase group labels) + white topbar + light canvas content area (`#F5F7FD`). Sidebar collapses to off-canvas on mobile. Content: Dashboard placeholder page. All routes except `/login` require an authenticated session.

Scope: only the above — no fake analytics dashboards, no users CRUD, no OAuth UI (backend routes exist but were not requested).

## Tasks

| ID | S# | Route | Status |
| --- | --- | --- | --- |
| T1 | S1, S2 | delegated: gentle-ai-worker | pending |
| T2 | S4, S5, S3 | delegated: gentle-ai-worker | pending |
| T3 | S6 | delegated: gentle-ai-worker | pending |
| T4 | S1-S6 | delegated: gentle-ai-verify | pending |

## Log

- L1 (2026-11-02, user request, verbatim): "Este es un sistema frontend administrativo desarrolado en react, typescript y material ui v9, arma la estructura necesaria para el proyecto. la documentación del backend esta en http://127.0.0.1:8000, puedes revisar su carpeta ../invento-backend/ para realizar la funcionalidad del login. Lee el archivo DESING.md para el esquema del theme por defecto."
- L2 (2026-11-02, evidence): Backend API docs at http://127.0.0.1:8000 unreachable ("No es posible conectar con el servidor remoto"). Contract sourced instead from `../invento-backend/routes/api.php` and `../invento-backend/src/Authentication/Infrastructure/Http/Controllers/LoginController.php` (OpenAPI annotations verbatim in S3), plus `../invento-backend/AUTHENTICATION_README.md` (refresh/logout endpoints).
- L3 (2026-11-02, decision): Frontend repo is empty (only DESIGN.md, DESIGN-preview.html). Theme source is `DESIGN.md` (user wrote "DESING.md"; actual file `DESIGN.md` at repo root, Kaiadmin Lite tokens).
- L4 (2026-11-02, worktree): `C:\Users\Nelson Luna\.local\share\opencode\worktree\6ef80a\feat\bootstrap-login`, branch `feat/bootstrap-login`.
