# Architecture

## High-level design

This is a single-page, client-rendered React application. Routes, authorization, layout, global UI state, and theme state all live in the frontend. No backend is included.

```text
public/index.html
  -> src/index.js
    -> App wrapped by global providers
      -> Redux store
      -> date localization
      -> MUI styled engine
      -> Emotion LTR/RTL cache
      -> MUI/Fuse theme
      -> local AuthProvider
      -> custom React Router
      -> route authorization
      -> selected Fuse layout
      -> route component
```

## Startup and provider tree

`src/index.js` loads i18n and the three generated-style entry files, creates a React 18 root, and renders `App`. The service worker is explicitly unregistered.

`withAppProviders.js` supplies:

- `AppContext`, containing the route array
- MUI X `LocalizationProvider` with `AdapterDateFns`
- Redux `Provider`
- MUI `StyledEngineProvider`

`App.js` then supplies:

- Direction-specific Emotion `CacheProvider`
- `FuseTheme`/MUI `ThemeProvider`
- `AuthProvider`
- the custom history-backed `BrowserRouter`
- `FuseAuthorization`
- Notistack `SnackbarProvider`
- `FuseLayout`

This order matters: auth needs Redux, authorization needs both router context and the user stored in Redux, and the layout needs route and theme state.

## Routing

Routes are centralized in `src/app/configs/routesConfig.js`. Fuse route configs are flattened by `FuseUtils.generateRoutesFromConfigs`.

| Path         | Component/behavior       | Required auth     |
| ------------ | ------------------------ | ----------------- |
| `/sign-in`   | `SignInPage`             | Guest role (`[]`) |
| `/`          | Redirect to `/dashboard` | Admin             |
| `/dashboard` | `DashboardPage`          | Admin             |
| `/loading`   | `FuseLoading`            | Not specified     |
| `/404`       | `Error404Page`           | Not specified     |
| `*`          | Redirect to `/404`       | Not specified     |

`settingsConfig.defaultAuth` is `authRoles.all`, which currently equals `['admin']`. A route that does not explicitly opt out of the default through a route config will normally inherit admin access.

Route-level `settings` can override layout configuration. The sign-in route hides navbar, toolbar, footer, and side panels.

## Authentication and authorization

### Authentication

`AuthProvider` subscribes to events from `jwtService`:

- `onAutoLogin`
- `onLogin`
- `onUserUpdated`
- `onLogout`
- `onNoAccessToken`

While the initial cookie check is running, the provider shows `FuseSplashScreen`. A successful check dispatches `setUser`; logout dispatches `logoutUser`.

Despite its name, the current `jwtService` does not issue, decode, refresh, or validate a JWT. It compares submitted credentials with hard-coded source values and stores a fixed value in a JavaScript-readable cookie. This is a demo stub only.

### Authorization

`FuseAuthorization` matches the current location against the route list and calls `FuseUtils.hasPermission(route.auth, userRole)`. Guests requesting protected pages are redirected to `/sign-in`; signed-in users requesting guest-only pages are redirected to the saved destination or configured login redirect.

Roles are currently represented as strings in user state, while permission definitions are arrays. The utility handles this current shape, but a future multi-role design should define a consistent type and tests.

## State management

The Redux store uses Redux Toolkit. Development mode adds `redux-logger`. Redux DevTools are enabled in development.

### Static reducers

| State path        | Responsibility                                   |
| ----------------- | ------------------------------------------------ |
| `user`            | Signed-in user and user settings                 |
| `i18n`            | Current language and available language metadata |
| `fuse.settings`   | Current/default layout and theme settings        |
| `fuse.navigation` | Role-filtered navigation entity state            |
| `fuse.navbar`     | Navbar open/folded/mobile state                  |
| `fuse.message`    | Global message/snackbar payload                  |
| `fuse.dialog`     | Global dialog payload and visibility             |

### Dynamic reducers

`store.asyncReducers`, `injectReducer`, and `withReducer` allow a feature to register its reducer when mounted. Dormant chat, notification, and quick-panel modules are organized for this pattern.

Both Redux Toolkit's immutable check and serializable check are disabled. This avoids friction with legacy Fuse state but removes useful development safeguards.

## Layout and navigation

Only `defaultLayout` is registered. It supports boxed, full-width, and constrained-container modes, with optional navbar, toolbar, footer, and side panels.

The application-level defaults disable the navbar, footer, and both side panels. The layout's own defaults keep the toolbar enabled, so the dashboard currently shows a top toolbar. The only configured navigation item is Dashboard.

Layout composition:

```text
Default layout
  left side panel (optional)
  main column
    navbar (optional)
    toolbar (active on dashboard)
    global dialog
    matched route
    footer (optional)
  right side panel (optional)
  global message
```

## Theme and styling

Theme settings are stored in Redux and converted to MUI themes by selectors in `settingsSlice.js`. `themesConfig.js` contains a default light theme, dark theme, legacy theme, and multiple alternative palettes.

Direction is derived from i18next. `App.js` creates separate Emotion caches for `ltr` and `rtl`, using `stylis-plugin-rtl` for RTL. `FuseTheme` also updates `body.dir` and the `light`/`dark` body class.

CSS pipeline:

- `app-base.css` — base/reset and Fuse globals
- `app-components.css` — imports print/table/Prism styles and Tailwind components
- `app-utilities.css` — Tailwind utilities
- `public/assets/tailwind-base.css` — prebuilt Tailwind base loaded by `public/index.html`
- `tailwind.config.js` — Fuse spacing/sizing theme, custom colors, breakpoints, typography, aspect ratio, and custom icon-size plugin

## Import aliases

Aliases are defined in both `aliases.js`/webpack override and `jsconfig.json`.

| Alias                     | Target                        | Current note                     |
| ------------------------- | ----------------------------- | -------------------------------- |
| `@fuse/*`                 | `src/@fuse/*`                 | Active reusable framework code   |
| `@history`                | `src/@history`                | Active shared browser history    |
| `@lodash`                 | `src/@lodash`                 | Local Lodash wrapper             |
| `app/store/*`             | `src/app/store/*`             | Active                           |
| `app/configs/*`           | `src/app/configs/*`           | Active                           |
| `app/theme-layouts/*`     | `src/app/theme-layouts/*`     | Active                           |
| `app/AppContext`          | `src/app/AppContext`          | Active                           |
| `app/shared-components/*` | `src/app/shared-components/*` | Target directory currently empty |
| `@ks/*`                   | `src/@ks/*`                   | Target directory absent          |
| `@mock-api`               | `src/@mock-api`               | Target directory absent          |

When aliases change, update both alias configuration files so webpack and editor tooling stay aligned.

## Directory map

```text
.
├── docker/                    development image definition
├── public/                    HTML shell, fonts, icon sprites, and static images
├── src/
│   ├── @fuse/                 reusable Fuse UI, hooks, colors, defaults, utilities
│   ├── @history/              singleton browser history
│   ├── @lodash/               local Lodash export wrapper
│   ├── app/
│   │   ├── auth/              auth provider, roles, local jwtService stub
│   │   ├── configs/           routes, navigation, themes, app settings
│   │   ├── main/              active route pages
│   │   ├── store/             Redux store and slices
│   │   └── theme-layouts/     layout and shared shell components
│   ├── styles/                global/Tailwind CSS entries
│   ├── authConfig.js          inactive Microsoft config stub
│   ├── i18n.js                i18next initialization
│   └── index.js               browser entry point
├── aliases.js                 alias source map
├── config-overrides.js        react-app-rewired webpack alias override
├── docker-compose.yml         development container orchestration
├── jsconfig.json              editor/module resolution aliases
├── package.json               scripts and dependency manifest
└── tailwind.config.js         Fuse/Tailwind design configuration
```

## API-related dormant modules

The shared shell contains slices that expect these relative endpoints:

- `/api/chat/contacts`
- `/api/chat/chats`
- `/api/chat/chats/:contactId`
- `/api/chat/user`
- `/api/notifications`
- `/api/notifications/:id`

No backend, proxy, Axios base URL, or active mock API is included. Enabling these panels without providing those endpoints will fail.

## Adding a feature safely

The recommended flow is:

1. Create the page under `src/app/main/<feature>/`.
2. Create a feature config with `auth`, optional layout `settings`, and `routes`.
3. Add that config to `routeConfigs` in `routesConfig.js`, or add a simple route directly for a very small page.
4. Add a matching navigation entry only if the page belongs in the shell navigation.
5. Use a feature slice and dynamic reducer only when local component state is insufficient.
6. Add route authorization and page smoke tests.
7. Verify guest, authorized, unauthorized, loading, empty, and API-error states.

The detailed workflow and examples are in [Developer guide](DEVELOPER_GUIDE.md).
