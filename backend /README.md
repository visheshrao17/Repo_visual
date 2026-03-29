# Repository + DevOps + CI/CD Visualizer Backend

Production-ready backend API for GitHub repository, workflow, runs, jobs, and logs visualization.

## Tech Stack

- Node.js 18+
- Express.js + TypeScript
- Prisma ORM
- PostgreSQL (Supabase-ready)
- BullMQ + Redis for background log processing
- JWT authentication
- Axios with retry logic
- Zod validation
- Pino logging

## Project Structure

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── repo/
│   │   ├── workflow/
│   │   ├── run/
│   │   ├── job/
│   │   ├── logs/
│   ├── integrations/
│   │   ├── github.ts
│   ├── middleware/
│   ├── utils/
│   ├── queue/
│   └── types/
├── prisma/
│   ├── schema.prisma
├── dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env.example
```

## Environment Variables

Copy `.env.example` to `.env` and update values.

```bash
cp .env.example .env
```

Required values:

- DATABASE_URL
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- GITHUB_REDIRECT_URI
- JWT_SECRET
- REDIS_URL (optional but required for queue workers)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Run migrations:

```bash
npx prisma migrate dev --name init
```

4. Start development server:

```bash
npm run dev
```

## API Endpoints

### Auth

- GET /auth/github/login
- GET /auth/github/callback

### User

- GET /me

### Repositories

- GET /repos?page=1&pageSize=10
- POST /repos/sync

### Workflows

- GET /repos/:repoId/workflows?page=1&pageSize=10

### Workflow Runs

- GET /repos/:repoId/runs?page=1&pageSize=10

### Jobs

- GET /runs/:runId/jobs

### Trigger CI/CD

- POST /workflows/:workflowId/trigger

Body:

```json
{
  "branch": "main"
}
```

### Logs

- GET /runs/:runId/logs
- GET /runs/:runId/logs?refresh=true

## Docker

Run backend + postgres + redis:

```bash
docker compose up --build
```

## Queue Processing

When Redis is configured, log extraction runs in a background worker:

1. Download workflow run ZIP logs
2. Extract ZIP entries
3. Parse entries into structured JSON
4. Store logs in PostgreSQL

## Notes for Supabase

Use Supabase PostgreSQL URI as `DATABASE_URL` and keep `sslmode=require` in connection params where needed.
