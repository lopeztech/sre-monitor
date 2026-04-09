# SRE Monitor

A dashboard for monitoring GitHub repositories across cost, pipelines, security, logs, and code coverage.

**Live:** [sre.lopezcloud.dev](https://sre.lopezcloud.dev)

## Stack

- **Frontend:** React 18, TypeScript, Vite, TanStack Router & Query, Zustand, Recharts, Tailwind CSS
- **Backend:** Node.js Cloud Run service (Google Cloud Functions Framework)
- **Infrastructure:** GCS (static hosting), Cloud Run, BigQuery, Cloud Logging

## Tabs

| Tab | Data Source |
|-----|------------|
| Costs | AWS Cost Explorer, GCP BigQuery billing export, Azure Cost Management |
| Pipelines | GitHub Actions API |
| Security | GitHub Dependabot Alerts API |
| Logs | Google Cloud Logging |
| Coverage | Codecov API |

## Project Structure

```
src/              Frontend (React SPA)
functions/        Backend (Cloud Run API)
shared/           Shared TypeScript types
.github/workflows CI/CD pipelines
```

## Development

```bash
npm install                 # install frontend deps
npm run dev                 # start dev server (localhost:5173)

cd functions && npm install # install backend deps
npm run dev                 # start API locally
```

## Scripts

```bash
npm run build          # type-check + production build
npm run lint           # ESLint
npm test               # run tests (Vitest)
npm run test:coverage  # tests with coverage report
```

## Deployment

Both frontend and backend deploy automatically on push to `master`:

- **Frontend** (`deploy.yml`): Builds and uploads to GCS, served via Cloud CDN
- **Backend** (`deploy-api.yml`): Builds Docker image, deploys to Cloud Run in `australia-southeast1`

## Authentication

Uses GitHub OAuth for repo access. Users connect their GitHub account to view private repository data. Sessions are stored as encrypted JWTs (7-day expiry).

## Environment Variables (Backend)

| Variable | Description |
|----------|------------|
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth App client ID (secret) |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth App client secret (secret) |
| `JWT_SECRET` | Session JWT signing key (secret) |
| `GCP_BILLING_PROJECT_ID` | GCP project for BigQuery billing queries |
| `GCP_BILLING_DATASET` | BigQuery dataset name |
| `GCP_BILLING_TABLE` | BigQuery billing export table name |
