# Repository + DevOps + CI/CD Visualizer Platform (Backend)

Production-ready FastAPI backend for GitHub repository, workflow, run, jobs, and logs visualization.

## Stack

- Python 3.11+
- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL (Supabase-compatible)
- httpx (async)
- Pydantic v2
- Redis (optional)
- FastAPI BackgroundTasks
- JWT authentication

## Project Structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── db/
│   ├── api/
│   ├── services/
│   ├── integrations/
│   ├── utils/
│   └── workers/
├── alembic.ini
├── requirements.txt
├── dockerfile
├── docker-compose.yml
└── .env.example
```

## Setup (Local)

1. Create env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Run migrations:

```bash
alembic upgrade head
```

4. Start API:

```bash
uvicorn app.main:app --reload
```

## Setup (Docker)

```bash
docker compose up --build
```

## OAuth Flow

1. Frontend calls `GET /auth/github/login`
2. User authorizes on GitHub
3. GitHub redirects to `GET /auth/github/callback?code=...`
4. Backend exchanges code for token, syncs user, issues JWT

## Important Endpoints

- `GET /auth/github/login`
- `GET /auth/github/callback`
- `GET /me`
- `GET /repos`
- `POST /repos/sync`
- `GET /repos/{repo_id}/workflows`
- `GET /repos/{repo_id}/runs`
- `GET /runs/{run_id}/jobs`
- `POST /workflows/{workflow_id}/trigger`
- `GET /runs/{run_id}/logs`

## Notes

- Supabase PostgreSQL works with `DATABASE_URL` using PostgreSQL DSN.
- Access tokens are encrypted at rest.
- Rate-limit responses from GitHub return graceful HTTP 429 errors.
- Jobs API returns graph-optimized `{nodes, edges}` for visualization.
