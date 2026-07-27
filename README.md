# React Fuse Admin Starter

This repository is the Read Al Quran operations and analytics dashboard. It provides a protected analytics workspace plus Al-Huda reader, feedback, and broadcast-notification operations.

Authentication is owned by the dashboard. The dashboard issues its own `HttpOnly` session cookie, then its server-side proxy calls Al-Huda admin APIs with a shared service token. The browser never receives the Al-Huda token and no longer depends on being signed in to the public Al-Huda website.

## Current stack

- React 18 and Create React App 5, customized through `react-app-rewired`
- React Router 6 with route-level role authorization
- Redux Toolkit and React Redux
- MUI 5, Emotion, Tailwind CSS 3, and Fuse UI components
- React Hook Form and Yup
- i18next with LTR/RTL support
- Dashboard server-issued, `HttpOnly` admin session authentication
- Server-side Al-Huda admin API proxy
- Docker Compose development setup

The manifest contains many additional editor, chart, date, and UI packages. A complete inventory, including packages that are declared but not currently detected in application code, is in [Dependencies](docs/DEPENDENCIES.md).

## Current user-facing routes

| Route        | Access      | Purpose                    |
| ------------ | ----------- | -------------------------- |
| `/sign-in`   | Guests only | Dashboard admin sign-in |
| `/`          | Admin       | Redirects to `/dashboard`  |
| `/dashboard` | Admin       | Google Analytics overview  |
| `/operations` | Admin     | Reader totals and broadcast notifications |
| `/operations/users` | Admin | Users, Quran state, and feedback management |
| `/loading`   | Public      | Fuse loading screen        |
| `/404`       | Public      | Not-found page             |
| `*`          | Public      | Redirects to `/404`        |

## Quick start

Requirements: Node.js 16+ and npm 8+. The current repository was verified with Node.js 20 and npm 10.

```bash
npm ci
npm start
```

Open `http://localhost:3000`. Ask the project owner for development credentials; do not copy credentials into documentation, issues, or chat.

For local development, `src/setupProxy.js` serves `/api/auth/*` and securely proxies `/api/alhuda/*` to the live Al-Huda origin. For production on Vercel, root `api/*` serverless functions provide the same auth and proxy flow.

Required dashboard environment variables:

| Variable | Purpose |
| --- | --- |
| `DASHBOARD_ADMIN_EMAIL` | Email allowed to sign in to the dashboard |
| `DASHBOARD_ADMIN_PASSWORD_SHA256` | SHA-256 hash of the dashboard password |
| `DASHBOARD_SESSION_SECRET` | Long random HMAC secret for dashboard session cookies |
| `ALHUDA_API_ORIGIN` | Al-Huda backend origin, for example `https://www.readalquran.online` |
| `ALHUDA_DASHBOARD_API_TOKEN` | Shared server-side token also configured in Al-Huda |

In Al-Huda, set the same `ALHUDA_DASHBOARD_API_TOKEN`. `ANALYTICS_DASHBOARD_URL` should point legacy `/admin` paths to the deployed dashboard.

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

Docker development, exposed on `http://localhost:3001`:

```bash
REACT_APP_NAME=admin-starter docker compose up --build
```

The Docker image does not currently install dependencies itself; the Compose setup expects the host `node_modules` directory to exist. Run `npm ci` before starting Docker.

## Documentation

- [Roman Urdu summary](docs/ROMAN_URDU_SUMMARY.md) — project ka asaan, short overview
- [Project analysis](docs/PROJECT_ANALYSIS.md) — current scope, capabilities, findings, and verified status
- [Architecture](docs/ARCHITECTURE.md) — startup flow, providers, routing, auth, Redux, layout, and directories
- [Dependencies](docs/DEPENDENCIES.md) — frameworks and complete dependency inventory
- [Developer guide](docs/DEVELOPER_GUIDE.md) — setup, commands, conventions, and common development tasks
- [Security and technical debt](docs/SECURITY_AND_TECH_DEBT.md) — risks and prioritized remediation plan

## Verification snapshot

The following checks were run on 2026-07-21:

- `npm ls --depth=0` — dependency tree resolves successfully
- `npm run build` — passes; main JavaScript bundle is approximately 373.32 kB gzip
- `npm run lint` — exits successfully, but no meaningful lint rules are configured yet
- `CI=true npm test -- --watchAll=false` — fails because the repository contains no tests
- `docker compose config` — renders, with warnings documented in the technical-debt report
- `npm audit` — reports known vulnerabilities; do not deploy before reviewing the security report

## Project status in one sentence

This is an active operations dashboard with dashboard-owned authentication and server-side Al-Huda admin API access. Dependency modernization, browser-level test coverage, and lint configuration remain planned hardening work.
# ReadAlQuran-dashboard
