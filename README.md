# IntelliHire — AI Job Portal & CV Optimizer

An AI-powered job portal that recommends roles, generates professional CVs, and optimizes uploaded resumes against job descriptions.

## 🛠️ Skills & Technologies

**AI & Generative AI:** Generative AI · LLMs · NLP · AI-powered CV Optimization · Job Recommendation

**Frontend:** Next.js · React · JavaScript · App Router

**Backend:** Python · Django · REST API

**Database:** PostgreSQL

**Deployment:** Vercel · Render

---

* **Frontend:** Next.js (App Router) — `frontend/` — deployed on **Vercel**
* **Backend:** Django + PostgreSQL REST API — `backend/` — deployed on **Render**

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

Open `http://localhost:3000`. The frontend talks to the backend at `http://127.0.0.1:8000` by default (override with `NEXT_PUBLIC_API_URL` in `.env.local`).

## Deployment

### Live instances

| Service      | Hosted on | URL                                           |
| ------------ | --------- | --------------------------------------------- |
| **Frontend** | Vercel    | https://intelli-hire-application.vercel.app   |
| **Backend**  | Render    | https://intelli-hire-application.onrender.com |

### How the two are wired

Each side is configured with **the other side's URL** — the frontend calls the backend, and the backend must allow the frontend's origin. Setting either one to its own URL breaks the pairing.

| Set on            | Variable               | Value              | Why                                  |
| ----------------- | ---------------------- | ------------------ | ------------------------------------ |
| Vercel (frontend) | `NEXT_PUBLIC_API_URL`  | the **Render** URL | the address it fetches jobs from     |
| Render (backend)  | `CORS_ALLOWED_ORIGINS` | the **Vercel** URL | the origin whose requests it accepts |

```text
Vercel frontend  ──── fetches /api/jobs/ ────▶  Render backend
(…vercel.app)    ◀─── allows that origin ─────  (…onrender.com)
```

Both values also default to the URLs above in code, so a redeploy alone is enough. Setting them explicitly in each dashboard is still preferred, and required if either URL changes.

**Changing a URL means updating both sides.** A mismatch fails quietly: the API answers `200 OK` with the full payload and the browser discards it, which looks like a dead backend but isn't. The jobs page detects this case and names it.

> Render's free tier sleeps after ~15 minutes idle, so the first request can take up to a minute. The frontend shows a loading state and recovers on its own once the service wakes.

### Backend → Render

The repo includes a `render.yaml` blueprint. In Render: **New → Blueprint**, point it at this repo. It provisions:

* A Python web service (root dir `backend/`, gunicorn) with `SECRET_KEY` auto-generated and migrations run on each deploy
* A managed PostgreSQL database wired in via `DATABASE_URL`

`CORS_ALLOWED_ORIGINS` is set by the blueprint to the **Vercel** URL — the origin allowed to call this API, not this service's own address. Vercel's per-branch preview subdomains are matched by regex in `settings.py`. Seed the database from the Render shell:

```bash
python seed_jobs.py && python seed_cv_dataset.py
```

### Frontend → Vercel

Import the repo in Vercel and set:

* **Root Directory:** `frontend`
* **Environment variable:** `NEXT_PUBLIC_API_URL` = `https://intelli-hire-application.onrender.com`

`NEXT_PUBLIC_*` is inlined at build time, so setting or changing it requires a **redeploy** — saving the variable alone has no effect. A production build without it falls back to the URL above rather than to localhost.

## Environment variables

| Variable                                                  | Where                          | Purpose                                           |
| --------------------------------------------------------- | ------------------------------ | ------------------------------------------------- |
| `SECRET_KEY`                                              | Render / `backend/.env`        | Django secret key                                 |
| `DEBUG`                                                   | Render / `backend/.env`        | `True` locally, `False` in production             |
| `DATABASE_URL`                                            | Render (auto)                  | Managed Postgres connection string                |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | `backend/.env`                 | Local Postgres                                    |
| `ALLOWED_HOSTS`                                           | Render (optional)              | Extra hosts, comma-separated                      |
| `CORS_ALLOWED_ORIGINS`                                    | Render (backend)               | Vercel frontend origin(s) allowed to call the API |
| `NEXT_PUBLIC_API_URL`                                     | Vercel / `frontend/.env.local` | Render backend base URL                           |
