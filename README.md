# CommunityHub

CommunityHub is a platform for managing communities, their members, meetings, tasks, and social activity. This repository is a monorepo that holds both the web frontend and the API backend in a single place, so the two applications can be developed, versioned, and reviewed together.

## Repository structure

```
CommunityHub/
├── backend/            NestJS API (TypeORM, PostgreSQL, Redis, WebSockets)
├── frontend/           Next.js web application (React, Tailwind CSS, next-auth)
├── .github/
│   └── workflows/      CI and deployment workflows
├── docker-compose.yml  Full local stack: database, cache, API, and web
├── .env.example        Environment template used by Docker Compose
└── README.md
```

Each application keeps its own `package.json`, lockfile, and `.env.example`, so they can be installed and deployed independently. The full history of both projects is preserved in this repository.

## Tech stack

Backend:
- NestJS 11 with a CQRS and modular architecture
- TypeORM with PostgreSQL
- Redis and Bull for background jobs
- WebSockets for real-time notifications
- Passport with JWT and Google OAuth
- Swagger and Scalar API reference

Frontend:
- Next.js 16 with the App Router and React 19
- Tailwind CSS and Radix UI
- next-auth for authentication
- Axios for API access

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker and Docker Compose (for the containerized workflow)

## Quick start with Docker Compose

This is the fastest way to run the entire stack (PostgreSQL, Redis, backend, and frontend) with a single command.

1. Create your environment file from the template:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and set at least `JWT_SECRET` and, if you use Google login, the `GOOGLE_*` values.

2. Start everything:

   ```bash
   docker compose up --build
   ```

3. Open the applications:

   | Service        | URL                                 | Notes                             |
   | -------------- | ----------------------------------- | --------------------------------- |
   | Frontend (web) | http://localhost:3001               | Next.js application               |
   | Backend (API)  | http://localhost:3000/api           | NestJS application, routes under /api |
   | API reference  | http://localhost:3000/api/reference | Scalar interactive API docs       |
   | PostgreSQL     | localhost:5433                      | Mapped from container port 5432   |
   | Redis          | localhost:6379                      | Cache and job queue               |

4. Stop the stack:

   ```bash
   docker compose down
   ```

   To also remove the database and cache volumes, run `docker compose down -v`.

### Optional: pgAdmin

pgAdmin is available under the `tools` profile so it does not start by default:

```bash
docker compose --profile tools up
```

It is then served at http://localhost:5050 using the `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` values from your `.env`.

### Optional: single origin gateway

By default the API and the web app run on separate ports. If you prefer a single origin, which also removes CORS from the picture, start the stack with the gateway override:

```bash
docker compose -f docker-compose.yml -f docker-compose.gateway.yml up --build
```

Everything is then served through a Traefik reverse proxy on port 8080:

| URL                       | Serves  |
| ------------------------- | ------- |
| http://localhost:8080     | Web app |
| http://localhost:8080/api | API     |

The two direct ports (3000 and 3001) stay available as well, so you can use whichever style you prefer.

## Local development without Docker

If you prefer to run the applications directly, start a PostgreSQL and a Redis instance yourself (or run only those two services with `docker compose up postgres redis`), then run each app.

### Backend

```bash
cd backend
cp .env.example .env      # set DB_HOST=localhost and your secrets
npm install
npm run start:dev
```

The API starts on http://localhost:3000 with all routes under the `/api` prefix (for example http://localhost:3000/api/reference). Database migrations are available through the `migration:*` scripts in `backend/package.json`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The web app starts on http://localhost:3000 by default. Because the backend also uses port 3000, run the frontend on another port when both run locally (for example `npm run dev -- -p 3001`), and set `NEXT_PUBLIC_BACKEND_URL` to the API base including the `/api` prefix (for example `http://localhost:3000/api`).

## Environment variables

The root `.env` is used by Docker Compose. The most important values are listed below.

| Variable                  | Used by            | Description                                     |
| ------------------------- | ------------------ | ----------------------------------------------- |
| `DB_HOST`                 | backend, database  | Database host (`postgres` inside Docker)        |
| `DB_PORT`                 | backend, database  | Database port                                   |
| `DB_USERNAME`             | backend, database  | Database user                                   |
| `DB_PASSWORD`             | backend, database  | Database password                               |
| `DB_DATABASE`             | backend, database  | Database name                                   |
| `JWT_SECRET`              | backend            | Secret used to sign JWT tokens                  |
| `GOOGLE_CLIENT_ID`        | backend            | Google OAuth client id                          |
| `GOOGLE_CLIENT_SECRET`    | backend            | Google OAuth client secret                      |
| `FRONTEND_URL`            | backend            | Allowed CORS origin for the web app             |
| `REDIS_HOST`              | backend            | Redis host (`redis` inside Docker)              |
| `NEXT_PUBLIC_BACKEND_URL` | frontend           | API base URL for the browser, including the `/api` prefix |

## Available ports

| Port | Service              |
| ---- | -------------------- |
| 3000 | Backend API          |
| 3001 | Frontend web app     |
| 5433 | PostgreSQL           |
| 6379 | Redis                |
| 5050 | pgAdmin (tools only) |
| 8080 | Gateway (gateway override only) |

## Deployment

The backend ships with a manual deployment workflow at `.github/workflows/backend-deploy.yml` that runs the test suite and deploys to an EC2 host over SSH. It is triggered from the Actions tab (`workflow_dispatch`) and expects the repository secrets `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. The workflow assumes the monorepo is checked out on the server and deploys from the `backend/` directory.

## Contributing

Create a feature branch from `main`, keep changes scoped to the relevant application where possible, and open a pull request. Frontend and backend can be worked on independently, and their histories remain intact for `git blame` and `git log --follow`.
