# Developer Guide

## Prerequisites

- Node.js 16 or newer
- npm 8 or newer
- Git
- Docker and Docker Compose only if using the container workflow

The project was verified with Node.js `20.20.2` and npm `10.8.2`. The Dockerfile uses Node `20.9.0` and installs npm `10.5.2`.

## First local setup

```bash
npm ci
npm start
```

The development server normally opens at `http://localhost:3000`.

The repository's `.npmrc` enables legacy peer resolution because the manifest mixes several package generations. Prefer `npm ci` for reproducible installs from `package-lock.json`.

Authentication is a local demo stub. Ask the project owner for development credentials. Never add those credentials to docs, screenshots, tickets, or commit messages.

## Available commands

| Command              | Purpose                                                   | Current behavior                                             |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `npm start`          | Start development server                                  | Uses `react-app-rewired`                                     |
| `npm run start:dev`  | Start development server                                  | Alias of `npm start`                                         |
| `npm run build`      | Create production bundle                                  | Disables source-map generation                               |
| `npm run preview`    | Serve production `build/`                                 | Uses `serve -s build`                                        |
| `npm test`           | Start CRA Jest runner                                     | No tests currently exist                                     |
| `npm run lint`       | Run ESLint                                                | Passes, but `.eslintrc` has no meaningful rules              |
| `npm run analyze`    | Build with source maps and generate an HTML bundle report | Uses `source-map-explorer`; not run during this analysis     |
| `npm run build-docs` | Run old MUI docs generator                                | Referenced source path is absent; currently expected to fail |
| `npm run eject`      | Eject CRA                                                 | Destructive/irreversible workflow; do not run casually       |

Recommended manual validation before a pull request:

```bash
npm run lint
CI=true npm test -- --watchAll=false --passWithNoTests
npm run build
```

`--passWithNoTests` only prevents the current empty test suite from failing. Remove it once the first tests are added.

## Docker development

Run a host install first because the current Dockerfile does not install packages and Compose bind-mounts the host `node_modules` directory:

```bash
npm ci
REACT_APP_NAME=admin-starter docker compose up --build
```

Open `http://localhost:3001`.

Known Docker limitations:

- `REACT_APP_NAME` has no default; omitting it produces the container name `-react` and a warning.
- Compose's top-level `version` field is obsolete.
- The image is a development image, not a production server image.
- Host source and dependencies are bind-mounted, so the image is not self-contained.

## Environment variables

Only one custom React variable was found:

| Variable                        | Used by             | Status                                  |
| ------------------------------- | ------------------- | --------------------------------------- |
| `REACT_APP_MICROSOFT_CLIENT_ID` | `src/authConfig.js` | Inactive/orphaned Microsoft auth config |

CRA also uses `PUBLIC_URL` internally. No API base URL is configured.

When real integrations are added:

1. Add a committed `.env.example` containing names and safe placeholder values only.
2. Keep real `.env*` secret files out of Git.
3. Remember that every `REACT_APP_*` value is embedded in the browser bundle and cannot be treated as a secret.

## Code organization rules

- Put route pages in `src/app/main/<feature>/`.
- Put application-wide config in `src/app/configs/`.
- Put Redux slices in `src/app/store/` or the owning feature folder.
- Put reusable Fuse framework changes in `src/@fuse/` only when they are genuinely generic.
- Keep feature-specific components close to their page rather than growing the framework layer.
- Prefer existing aliases such as `@fuse`, `app/store`, and `app/configs` over deep relative imports.
- If adding/changing an alias, update both `aliases.js` and `jsconfig.json`.
- Use MUI 5 APIs for components and theming. Avoid adding new MUI v4/alpha/next usage.
- Prefer date-fns for new date code because it backs the global date adapter.
- Prefer Redux Toolkit when state must be global; use component state for local UI state.

## Adding a page

For a simple protected page, create the component and add a route in `routesConfig.js`:

```jsx
import ExamplePage from '../main/example/ExamplePage';

{
  path: '/example',
  element: <ExamplePage />,
  auth: settingsConfig.defaultAuth,
}
```

For a multi-route feature, follow the existing `SignInConfig` pattern:

```jsx
const ExampleConfig = {
  auth: authRoles.all,
  routes: [
    {
      path: "example",
      element: <ExamplePage />,
    },
  ],
};
```

Add `ExampleConfig` to the `routeConfigs` array. Add navigation separately in `navigationConfig.js`:

```js
{
  id: 'example',
  title: 'Example',
  type: 'item',
  icon: 'heroicons-outline:collection',
  url: '/example',
  auth: authRoles.all,
}
```

Route access is the security boundary in this frontend. A navigation item's role filter only hides the link; it does not replace route authorization or backend authorization.

## Adding state

Use a normal root slice for state that is always needed. Add it to `rootReducer.js`.

Use the existing dynamic reducer pattern for large feature modules that should load only with the feature:

```jsx
export default withReducer("example", exampleReducer)(ExamplePage);
```

Because serializability checks are disabled globally, developers must be disciplined: keep functions, DOM nodes, class instances, and unresolved promises out of Redux state unless a well-reviewed legacy component requires them.

## Adding API integration

There is no standard API client yet. Before adding multiple endpoints, establish one shared Axios client with:

- environment-based base URL
- request timeout
- JSON/content-type defaults
- authenticated request strategy
- consistent error normalization
- cancellation support for unmounted screens
- 401/403 handling
- no logging of tokens or personal data

Do not copy the current demo `jwtService` pattern into production features. Real authorization must be enforced by the backend.

## Styling

Use MUI components for accessible behavior and theme-aware widgets, and Tailwind utilities for layout/spacing. Existing code commonly combines both:

```jsx
<Paper className="w-full rounded-8 p-32" variant="outlined">
  <Typography color="text.secondary">Content</Typography>
</Paper>
```

Important conventions:

- Tailwind breakpoints align with MUI-era values: `sm 600`, `md 960`, `lg 1280`, `xl 1920`.
- The root font-size is 10 px equivalent, so Fuse rem sizing differs from browser defaults.
- Theme colors should come from MUI (`sx`, `color`, theme callbacks) rather than hard-coded colors where possible.
- Use `FuseSvgIcon` with the public sprite syntax such as `heroicons-outline:home`.
- RTL is already supported at the Emotion cache and document-direction levels.

## Testing expectations

Start the test suite with these high-value cases:

1. Guest visiting `/dashboard` is redirected to `/sign-in`.
2. Admin visiting `/sign-in` is redirected away.
3. Sign-in form validates email and required password.
4. Invalid starter credentials display an accessible error.
5. Dashboard renders for an authenticated user.
6. Logout removes auth state and returns to sign-in.
7. Unknown route reaches the 404 page.

For every new feature, cover loading, success, empty, error, unauthorized, and permission-limited states as applicable.

## Troubleshooting

### Install reports peer conflicts

Use the committed npm settings through `npm ci`. Do not add ad-hoc `--force` flags to shared instructions. The long-term fix is dependency cleanup.

### A route renders without the expected shell

Check route-level `settings`, application `settingsConfig`, and `LayoutConfig` merge order. Sign-in intentionally hides all shell sections.

### A menu entry is missing

Check the navigation item's `auth`, current `user.role`, and whether the navbar is enabled. The current global settings disable the navbar.

### Chat or notifications call 404 endpoints

Those modules expect `/api/chat/*` and `/api/notifications*`, but this repository contains no backend or configured mock API.

### A new alias resolves in the editor but not the build

Keep `jsconfig.json` and `aliases.js` synchronized.

### Build shows a Browserslist warning

Update the Browserslist database in a dedicated dependency-maintenance change, verify the lockfile diff, and rebuild.

## Pull-request checklist

- No secrets or credentials added
- Route and navigation permissions reviewed
- Loading/error/empty states handled
- Mobile and RTL behavior checked where relevant
- Keyboard and accessible names checked
- Redux state remains serializable where possible
- New environment names documented in `.env.example`
- Tests added or updated
- `npm run lint` and `npm run build` pass
- Dependency changes include an audit/build review
