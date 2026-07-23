# React Fuse Admin Starter

This repository is a Fuse-derived React admin starter. It currently provides a local sign-in flow, a protected dashboard, a reusable Fuse component layer, theming, routing, Redux state, internationalization, and local/Docker development commands.

> Important: authentication is currently a browser-only demo implementation with credentials embedded in source code. It is not suitable for production. See [Security and technical debt](docs/SECURITY_AND_TECH_DEBT.md) before extending or deploying the app.

## Current stack

- React 18 and Create React App 5, customized through `react-app-rewired`
- React Router 6 with route-level role authorization
- Redux Toolkit and React Redux
- MUI 5, Emotion, Tailwind CSS 3, and Fuse UI components
- React Hook Form and Yup
- i18next with LTR/RTL support
- Cookie-based demo authentication
- Docker Compose development setup

The manifest contains many additional editor, chart, date, and UI packages. A complete inventory, including packages that are declared but not currently detected in application code, is in [Dependencies](docs/DEPENDENCIES.md).

## Current user-facing routes

| Route        | Access      | Purpose                    |
| ------------ | ----------- | -------------------------- |
| `/sign-in`   | Guests only | Local starter sign-in form |
| `/`          | Admin       | Redirects to `/dashboard`  |
| `/dashboard` | Admin       | Starter dashboard          |
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

This is a working frontend starter and component foundation, not yet a production-ready admin product: real API authentication, tests, dependency cleanup, security upgrades, and feature modules still need to be implemented.
# ReadAlQuran-dashboard
