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

### Backend → Render

The repo includes a [render.yaml](render.yaml) blueprint. In Render: **New → Blueprint**, point it at this repo. It provisions:

- A Python web service (root dir `backend/`, gunicorn) with `SECRET_KEY` auto-generated and migrations run on each deploy
- A managed PostgreSQL database wired in via `DATABASE_URL`

After the first deploy, set the `CORS_ALLOWED_ORIGINS` env var to your Vercel URL (e.g. `https://your-app.vercel.app`) and seed the database from the Render shell:

```bash
python seed_jobs.py && python seed_cv_dataset.py
```

### Frontend → Vercel

Import the repo in Vercel and set:

- **Root Directory:** `frontend`
- **Environment variable:** `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://intellihire-backend.onrender.com`)

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
