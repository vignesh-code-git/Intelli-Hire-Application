# IntelliHire — AI Job Portal & CV Optimizer

An AI-powered job portal that recommends roles, generates professional CVs, and optimizes uploaded resumes against job descriptions.

- **Frontend:** Next.js (App Router) — `frontend/` — deployed on **Vercel**
- **Backend:** Django + PostgreSQL REST API — `backend/` — deployed on **Render**

## Local development

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a PostgreSQL database and user (defaults: `intellihire` / `intellihire`), then copy `.env.example` to `.env` and fill in `SECRET_KEY`, `DB_PASSWORD`, and set `DEBUG=True`.

```bash
python manage.py migrate
python seed_jobs.py        # seed job listings
python seed_cv_dataset.py  # seed CV content snippets
python manage.py runserver 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. The frontend talks to the backend at `http://127.0.0.1:8000` by default (override with `NEXT_PUBLIC_API_URL` in `.env.local`).

## Deployment

Live instances:

| Part | URL |
|---|---|
| Frontend (Vercel) | https://intelli-hire-application.vercel.app |
| Backend (Render) | https://intelli-hire-application.onrender.com |

The two must know about each other: the frontend needs the backend URL as
`NEXT_PUBLIC_API_URL`, and the backend needs the frontend origin in
`CORS_ALLOWED_ORIGINS`. Both now default to the URLs above in code, so a
redeploy is enough — but setting them explicitly is still preferred, and
required if either URL changes.

> The backend runs on Render's free tier and sleeps after ~15 minutes idle.
> The first request then takes up to a minute; the frontend shows a loading
> state for it and recovers on its own once the service wakes.

### Backend → Render

The repo includes a [render.yaml](render.yaml) blueprint. In Render: **New → Blueprint**, point it at this repo. It provisions:

- A Python web service (root dir `backend/`, gunicorn) with `SECRET_KEY` auto-generated and migrations run on each deploy
- A managed PostgreSQL database wired in via `DATABASE_URL`

`CORS_ALLOWED_ORIGINS` is set by the blueprint to the Vercel URL above. Change it there (or in the dashboard) if the frontend URL changes — without a matching origin the API answers normally and the browser discards every response. Seed the database from the Render shell:

```bash
python seed_jobs.py && python seed_cv_dataset.py
```

### Frontend → Vercel

Import the repo in Vercel and set:

- **Root Directory:** `frontend`
- **Environment variable:** `NEXT_PUBLIC_API_URL` = `https://intelli-hire-application.onrender.com`

`NEXT_PUBLIC_*` is inlined at build time, so setting or changing it requires a **redeploy** — saving the variable alone has no effect. A production build without it falls back to the URL above rather than to localhost.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `SECRET_KEY` | Render / `backend/.env` | Django secret key |
| `DEBUG` | Render / `backend/.env` | `True` locally, `False` in production |
| `DATABASE_URL` | Render (auto) | Managed Postgres connection string |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | `backend/.env` | Local Postgres (used when `DATABASE_URL` is absent) |
| `ALLOWED_HOSTS` | Render (optional) | Extra hosts, comma-separated (Render's own hostname is added automatically) |
| `CORS_ALLOWED_ORIGINS` | Render | Vercel frontend URL(s), comma-separated |
| `NEXT_PUBLIC_API_URL` | Vercel / `frontend/.env.local` | Backend API base URL |
