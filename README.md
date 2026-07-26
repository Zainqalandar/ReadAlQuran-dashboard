# React Fuse Admin Starter

This repository is the Read Al Quran operations and analytics dashboard. It provides a protected analytics workspace plus Al-Huda reader, feedback, and broadcast-notification operations.

Authentication is enforced by Al-Huda. The dashboard uses an Al-Huda-issued `HttpOnly` session cookie; it does not contain credentials, an admin token, or a database connection in its frontend bundle.

## Current stack

- React 18 and Create React App 5, customized through `react-app-rewired`
- React Router 6 with route-level role authorization
- Redux Toolkit and React Redux
- MUI 5, Emotion, Tailwind CSS 3, and Fuse UI components
- React Hook Form and Yup
- i18next with LTR/RTL support
- Al-Huda server-issued, `HttpOnly` admin session authentication
- Docker Compose development setup

The manifest contains many additional editor, chart, date, and UI packages. A complete inventory, including packages that are declared but not currently detected in application code, is in [Dependencies](docs/DEPENDENCIES.md).

## Current user-facing routes

| Route        | Access      | Purpose                    |
| ------------ | ----------- | -------------------------- |
| `/sign-in`   | Guests only | Al-Huda admin sign-in |
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

For local development, `.env.development` uses `/alhuda`, which the dev server securely proxies to the live Al-Huda origin. For a deployed dashboard, `.env` uses the public Al-Huda URL. In Al-Huda, set `ANALYTICS_DASHBOARD_ORIGINS` to this dashboard origin and `ANALYTICS_DASHBOARD_URL` to the deployed dashboard URL.

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

This is an active operations dashboard with server-enforced Al-Huda admin access. Dependency modernization, browser-level test coverage, and lint configuration remain planned hardening work.
# ReadAlQuran-dashboard
