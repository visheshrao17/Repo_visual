# Repository + DevOps + CI/CD Visualizer Platform (Frontend)

Production-ready React frontend for repository monitoring, CI/CD pipeline graph visualization, workflow operations, and log inspection.

## Stack

- React + Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- TanStack Query (React Query)
- Zustand
- React Flow
- Headless reusable UI components
- xterm.js

## Environment Variables

Create and edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Repository + DevOps + CI/CD Visualizer
```

## Install and Run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Routes

- `/login`
- `/dashboard`
- `/repo/:repoId`
- `/repo/:repoId/pipeline`
- `/run/:runId/logs`

All routes except `/login` are protected.

## Authentication Flow

1. User clicks **Login with GitHub**.
2. Frontend redirects to `${VITE_API_BASE_URL}/auth/github/login`.
3. Backend handles GitHub OAuth and returns JWT via callback response.
4. JWT is stored in localStorage and sent in `Authorization: Bearer <token>` through Axios interceptor.

## Features

- Repository list dashboard with search, sync, and pagination.
- Repository detail page with workflows, runs, statuses, and manual trigger support.
- Pipeline graph view with React Flow nodes and edges (`build -> test -> deploy` style), zoom, pan, and node click handling.
- Logs page with xterm.js terminal rendering and regex-based error highlighting.
- Dark mode support with persisted preference.
- Real-time data refresh via polling on runs, graph, and logs.
- Loading skeletons and consistent error states.

## Folder Structure

```text
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   ├── pages/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── pipeline/
│   │   ├── logs/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── constants/
├── index.html
├── package.json
├── tsconfig.json
└── .env
```

## API Integration Notes

- Pagination is mapped to backend `PaginatedResponse` shape: `items + meta`.
- Pipeline graph endpoint expects `{ nodes, edges }` and is transformed into React Flow elements.
- Retry and global request error handling are configured in React Query and Axios.

## Production Notes

- Keep `VITE_API_BASE_URL` pointed to your deployed API domain.
- For OAuth in production, ensure GitHub app callback URL and backend redirect URI are correctly configured.
