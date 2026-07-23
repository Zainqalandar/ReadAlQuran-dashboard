# Security and Technical Debt

Snapshot date: 2026-07-21. Security advisory results change over time; re-run the commands before making release decisions.

## Release recommendation

Do not deploy this repository as a production admin application in its current form. The frontend build works, but the authentication flow is intentionally local/demo-only, known dependency vulnerabilities exist, and no automated tests protect the authorization behavior.

## Priority 0: replace demo authentication

The current `jwtService` contains development credentials and a fixed token value in browser-delivered source. It writes that value into a JavaScript-readable cookie and treats possession of the value as authentication.

Consequences:

- Anyone receiving the frontend bundle can inspect the credential check.
- The cookie is not a server-issued proof of identity.
- There is no refresh, expiry validation, revocation, CSRF strategy, or backend authorization.
- Client-side role checks can always be bypassed by a user controlling their browser.

Required remediation:

1. Remove hard-coded credentials and the fixed starter token from tracked source and history where appropriate.
2. Define a backend authentication contract.
3. Prefer a server-set `HttpOnly`, `Secure`, appropriately scoped `SameSite` session cookie, or use a carefully designed OAuth/OIDC flow.
4. Enforce every permission on the backend; frontend role checks are UX only.
5. Add login, logout, expiry, refresh/session renewal, 401, 403, and role tests.
6. Rotate any credential if it has ever been reused outside this local starter.

The credentials are intentionally not reproduced in these docs.

## Priority 0/1: dependency advisories

`npm audit` reported:

| Severity | Count |
| -------- | ----: |
| Critical |     5 |
| High     |    39 |
| Moderate |    26 |
| Low      |    15 |
| Total    |    85 |

Direct dependencies flagged by the audit include:

- Critical: `crypto-js`
- High: `axios`, `draft-js`, `immutable`, `js-cookie`, `lodash`, `react-draft-wysiwyg`, `react-scripts`, `serve`, `tinymce`
- Moderate: `postcss`, `prismjs`, `qs`, `react-quill`, `react-router-dom`, `react-swipeable-views`
- Low: `@babel/core`

Many reported issues are in build tooling or currently unused feature packages, but unused vulnerable code still increases install-chain and maintenance risk. Some transitive findings originate in the old CRA toolchain.

Recommended approach:

1. Remove packages that are not needed, especially unused editors, charts, extra UI generations, MobX, and duplicate date libraries.
2. Upgrade retained direct runtime packages and verify behavior.
3. Review transitive findings and the CRA migration path.
4. Re-run production-only and full audits.
5. Document any accepted risk with exposure and compensating controls.

Do not use `npm audit fix --force` blindly. The audit may propose breaking or invalid toolchain changes.

## Priority 1: no automated tests

`CI=true npm test -- --watchAll=false` exits with code 1 because Jest finds zero tests across 187 checked JavaScript files.

Authorization and login redirect behavior are especially regression-prone. Add the tests listed in [Developer guide](DEVELOPER_GUIDE.md#testing-expectations) before business modules are built on top of the starter.

## Priority 1: ineffective lint configuration

The lint command exits successfully, but `.eslintrc` contains only `{}`. Airbnb, CRA, React, hooks, accessibility, Prettier, TypeScript, and unused-import lint packages are installed without an explicit project ruleset.

Choose one maintained configuration, make `npm run lint` target the source tree explicitly, and add it to CI. Avoid enabling every installed legacy plugin at once; clean the dependency set first and adopt rules in a controlled change.

## Priority 1: overlapping and unused dependencies

The repository declares:

- MUI v4, MUI v5, MUI 6 alpha, Base, Joy, Lab, and X packages
- Editor.js plus 17 plugins
- TinyMCE, Draft.js, and Quill editor families
- Redux Toolkit and MobX
- date-fns, Moment, and Day.js
- multiple chart/grid packages not used by active routes

This causes larger installs, more advisories, confusing API choices, and harder upgrades. The dependency report identifies cleanup candidates. Establish MUI 5 + Emotion + Tailwind, Redux Toolkit, and date-fns as defaults unless product requirements say otherwise.

## Priority 1: inactive API modules have no backend contract

Dormant chat and notification stores call relative `/api/...` paths with Axios. No Axios base URL, interceptors, mock adapter initialization, dev proxy, or server is present.

Before enabling these modules, create a shared API layer, authentication integration, standardized error handling, request cancellation, and endpoint documentation.

## Priority 2: old build platform and package drift

The project uses Create React App 5 and `react-app-rewired`. The build currently succeeds, but this toolchain accounts for significant transitive dependency age and makes customization less transparent.

A migration should be planned, not rushed:

1. Add smoke tests.
2. Remove unused packages and code.
3. Document required aliases, SVG behavior, PostCSS/Tailwind processing, environment variables, and SPA fallback.
4. Reproduce the build on the selected maintained platform.
5. Compare routing, asset paths, bundle size, and browser support before switching.

The production build currently warns that `caniuse-lite` is outdated.

## Priority 2: Docker is not reproducible

Observed Compose warnings:

- `REACT_APP_NAME` is unset and defaults to blank, producing `container_name: -react`.
- The Compose `version` attribute is obsolete.

The Dockerfile copies source but leaves `npm install` commented out. Compose bind-mounts both the project and host `node_modules`, so a clean image cannot independently start the project.

Recommended split:

- Development image: install dependencies in-image, use a named volume for `node_modules`, and avoid a required dynamic container name.
- Production image: multi-stage build followed by a small static server image with SPA fallback, non-root user, health check, and immutable assets.

## Priority 2: stale configuration and commands

- `build-docs` points to a missing Material UI documentation builder.
- `analyze` requests source-map analysis while the shared build command disables source maps; verify this workflow.
- `authConfig.js` defines Microsoft settings without an installed/active MSAL integration.
- `@ks` and `@mock-api` aliases target absent directories.
- `app/shared-components` alias targets an empty directory.
- Numerous empty feature directories suggest removed or incomplete modules.
- `package.json` lacks a package `name`, description, license metadata, and repository metadata.

Remove or repair stale configuration so new developers can trust the manifest and scripts.

## Priority 2: state safety checks disabled

Redux Toolkit's `immutableCheck` and `serializableCheck` are both disabled. This may support legacy Fuse components, but it makes accidental state mutation and non-serializable state harder to detect.

Audit the current slices, enable checks where possible, or narrow ignored actions/paths instead of disabling both globally.

## Priority 2: settings query parsing can crash

`getParsedQuerySettings()` parses a `defaultSettings` URL parameter with an unguarded `JSON.parse`. A malformed value can crash application initialization. Wrap parsing in validation/error handling and restrict which settings can be overridden from the URL.

## Priority 3: bundle and asset hygiene

The successful production build reports a 373.32 kB gzip main JavaScript bundle. The public directory also contains a large Material UI demo asset collection, local font families, and multiple icon sprites. The generated `build/` directory is present locally but Git-ignored.

Use the bundle analyzer to identify large modules, then remove unreachable demo components/assets. Keep only icon families and images required by the product.

## Priority 3: PWA ambiguity

Service-worker code and a web manifest are present, but `serviceWorker.unregister()` is called. Decide whether the product is a PWA:

- If no, remove obsolete service-worker code and stale PWA assets.
- If yes, implement an update strategy, offline behavior, cache invalidation, and tests before registering it.

## Suggested remediation sequence

### Phase 1: secure the foundation

- Replace local authentication
- Add authorization and login tests
- Upgrade immediately exposed runtime dependencies
- Configure meaningful lint checks

### Phase 2: reduce the surface

- Remove unused editors, UI generations, state/date libraries, and demo modules
- Remove stale aliases/scripts/configs
- Review public assets and bundle composition

### Phase 3: improve delivery

- Repair development and production Docker workflows
- Add CI for install, lint, test, build, and audit reporting
- Add error monitoring and runtime configuration conventions

### Phase 4: modernize deliberately

- Choose a maintained build platform
- Migrate with test coverage and bundle comparisons
- Re-enable Redux safety checks or document narrow exceptions

## Security verification commands

```bash
npm audit
npm audit --omit=dev
npm run lint
CI=true npm test -- --watchAll=false
npm run build
```

Audit output is a lead for risk analysis, not a complete security assessment. Review actual reachability, runtime context, backend controls, and advisory details before release.
