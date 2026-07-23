# Dependencies and Frameworks

This inventory is based on `package.json`, the npm v3 lockfile, installed top-level packages, and a static source/config reference scan on 2026-07-21.

“Not detected” means the package name was not found in current application source or build configuration. It is a cleanup candidate, not proof that removal is safe: transitive use, generated code, CSS processing, or planned work may still matter. Remove packages in small groups and rebuild/test after each group.

## Primary framework stack

| Area          | Package/version                                      | Current role                                  |
| ------------- | ---------------------------------------------------- | --------------------------------------------- |
| UI runtime    | `react@18.2.0`, `react-dom@18.2.0`                   | Application and DOM rendering                 |
| Build         | `react-scripts@5.0.1`, `react-app-rewired@2.2.1`     | CRA build/dev/test with override support      |
| Routing       | `react-router-dom@6.3.0`, `history@5.3.0`            | Route rendering and shared imperative history |
| State         | `@reduxjs/toolkit@1.8.6`, `react-redux@8.0.2`        | Global state and slices                       |
| Component UI  | `@mui/material@5.11.0`, `@mui/icons-material@5.11.0` | Active component and theme system             |
| Styling       | Emotion 11, Tailwind CSS 3.3.2, `clsx`               | MUI engine, utilities, conditional classes    |
| Forms         | `react-hook-form@7.34.2`, Yup 0.32.11                | Sign-in state and validation                  |
| i18n          | i18next 22.4.5, react-i18next 11.18.4                | Language state and RTL direction              |
| Auth storage  | `js-cookie@^3.0.1`                                   | Demo access cookie                            |
| Dates         | `date-fns@2.29.3`, MUI X date pickers 5.0.20         | Global date-picker localization               |
| Notifications | `notistack@1.0.6-next.3`                             | Snackbar provider                             |

## Runtime dependencies referenced by source/config

These packages have direct references in the checked-in code or active configuration. Some references belong to reusable/dormant Fuse components rather than the currently reachable pages.

### Core, routing, and state

- `react` `18.2.0`
- `react-dom` `18.2.0`
- `react-router-dom` `6.3.0`
- `history` `5.3.0`
- `@reduxjs/toolkit` `1.8.6`
- `react-redux` `8.0.2`
- `redux-logger` `4.0.0` — development logging

### MUI, styling, and layout

- `@mui/material` `^5.11.0`
- `@mui/icons-material` `5.11.0`
- `@mui/styles` `5.11.0` — legacy MUI styling in palette tooling
- `@mui/system` `5.11.0`
- `@mui/x-date-pickers` `^5.0.20`
- `@emotion/cache` `11.10.5`
- `@emotion/react` `^11.11.4`
- `tailwindcss` `^3.3.2`
- `@tailwindcss/typography` `^0.5.8`
- `@tailwindcss/aspect-ratio` `^0.4.2`
- `stylis-plugin-rtl` `2.1.1`
- `clsx` `1.2.1`
- `styled-components` `5.3.6` — Fuse demo frame compatibility

### Forms, dates, and language

- `react-hook-form` `7.34.2`
- `@hookform/resolvers` `2.9.10`
- `yup` `0.32.11`
- `date-fns` `2.29.3`
- `moment` `2.29.4` — reusable countdown component
- `i18next` `22.4.5`
- `react-i18next` `11.18.4`

### UI utilities and interaction

- `framer-motion` `^7.9.1`
- `notistack` `1.0.6-next.3`
- `perfect-scrollbar` `1.5.5`
- `react-popper` `2.3.0`
- `react-swipeable` `7.0.0`
- `react-autosuggest` `10.1.0`
- `autosuggest-highlight` `3.3.4`
- `mobile-detect` `1.4.5`
- `keycode` `2.2.1`
- `prop-types` `15.8.1`

### Data, content, and utilities

- `axios` `1.2.1` — dormant chat/notification requests
- `js-cookie` `^3.0.1` — active demo auth
- `lodash` `4.17.21`
- `qs` `6.11.0`
- `prismjs` `1.29.0`
- `web-vitals` `2.1.4`

## Build/runtime support dependencies

These are primarily used through scripts or the build pipeline, so direct component imports are not expected.

| Package                       | Declared version | Purpose                                                              |
| ----------------------------- | ---------------- | -------------------------------------------------------------------- |
| `react-app-rewired`           | `2.2.1`          | Runs CRA through `config-overrides.js`                               |
| `react-app-alias`             | `2.2.2`          | Applies webpack aliases                                              |
| `react-scripts`               | `5.0.1`          | Webpack/Babel/Jest/PostCSS toolchain                                 |
| `cross-env`                   | `7.0.3`          | Sets build environment flags portably                                |
| `autoprefixer`                | `10.4.7`         | CSS vendor prefixes                                                  |
| `postcss`                     | `8.4.20`         | CSS processing                                                       |
| `serve`                       | `^14.2.0`        | Serves the `build` directory for preview                             |
| `source-map-explorer`         | `2.5.3`          | Bundle analysis command                                              |
| `core-js`                     | `3.26.1`         | Polyfill support dependency                                          |
| `promise`                     | `8.3.0`          | Promise/polyfill support                                             |
| `typescript`                  | `4.6.4`          | CRA/ESLint TypeScript support; project source is JavaScript          |
| `util`                        | `^0.12.5`        | Browser-compatible Node utility package                              |
| `@emotion/styled`             | `^11.11.0`       | MUI's default Emotion styling peer; no direct app import is required |
| `prettier`                    | `^2.8.4`         | Formatter                                                            |
| `prettier-plugin-tailwindcss` | `^0.2.2`         | Tailwind class sorting                                               |

## Declared but not detected in current source

### Editor.js family

All of the following are installed, but no Editor.js implementation was found:

- `@editorjs/editorjs` `^2.26.5`
- `@editorjs/attaches` `^1.3.0`
- `@editorjs/checklist` `^1.5.0`
- `@editorjs/code` `^2.8.0`
- `@editorjs/delimiter` `^1.3.0`
- `@editorjs/embed` `^2.5.3`
- `@editorjs/header` `^2.7.0`
- `@editorjs/image` `^2.8.1`
- `@editorjs/inline-code` `^1.4.0`
- `@editorjs/link` `^2.5.0`
- `@editorjs/list` `^1.8.0`
- `@editorjs/marker` `^1.3.0`
- `@editorjs/paragraph` `^2.9.0`
- `@editorjs/quote` `^2.5.0`
- `@editorjs/raw` `^2.4.0`
- `@editorjs/simple-image` `^1.5.1`
- `@editorjs/table` `^2.2.1`
- `@editorjs/warning` `^1.3.0`

`@editorjs/simple-image` is duplicated in both `dependencies` and `devDependencies`.

### Other rich-text editors

- `@tinymce/tinymce-react` `^5.0.0`
- `tinymce` `^7.0.0`
- `draft-js` `^0.11.7`
- `draftjs-to-html` `0.9.1`
- `react-draft-wysiwyg` `^1.15.0`
- `react-quill` `^2.0.0`
- `marked` `4.2.4`

Maintaining four editor approaches creates unnecessary size and security work. Choose one only when an editor requirement is defined.

### Charts and data grid

- `apexcharts` `^3.37.2`
- `react-apexcharts` `^1.4.0`
- `@mui/x-data-grid` `5.17.14`

### Additional UI generations and components

- `@material-ui/core` `^4.12.4`
- `@mui/base` `5.0.0-alpha.110`
- `@mui/joy` `^5.0.0-beta.31`
- `@mui/lab` `5.0.0-alpha.112`
- `@mui/material-next` `6.0.0-alpha.66`
- `@mui/utils` `5.11.0`
- `material-ui-popup-state` `2.0.1`
- `react-swipeable-views` `^0.14.0`
- `stylis` `4.1.3` — only `stylis-plugin-rtl` is directly imported
- `@tailwindcss/line-clamp` `^0.4.2` — line clamping is built into Tailwind 3; the separate plugin is not configured

The active code should be treated as MUI 5. Do not introduce MUI v4 or alpha APIs without an explicit migration decision.

### Other undeployed capabilities

- `axios-mock-adapter` `1.21.2`
- `crypto-js` `4.1.1`
- `dayjs` `^1.11.10`
- `immutable` `4.0.0`
- `jwt-decode` `3.1.2`
- `mobx` `^6.7.0`
- `react-draft-wysiwyg` `^1.15.0`
- `react-quill` `^2.0.0`

The application already uses Redux Toolkit; MobX adds a second state model without a current use case. Likewise, three date libraries are declared while the active localization provider uses date-fns.

## Development dependencies

| Package                     | Declared version | Purpose/status                                     |
| --------------------------- | ---------------- | -------------------------------------------------- |
| `@babel/core`               | `7.20.5`         | Babel compiler core                                |
| `@babel/eslint-parser`      | `7.19.1`         | Babel-aware ESLint parsing                         |
| `@babel/node`               | `7.20.5`         | Executes Babel-based scripts                       |
| `@babel/preset-env`         | `7.20.2`         | JavaScript target transforms                       |
| `@babel/preset-react`       | `7.18.6`         | JSX transforms                                     |
| `eslint`                    | `^8.57.0`        | Linter; rules still need configuration             |
| `eslint-config-airbnb`      | `^19.0.4`        | Available but not extended by `.eslintrc`          |
| `eslint-config-react-app`   | `^7.0.1`         | CRA lint configuration                             |
| `eslint-plugin-import`      | `^2.27.5`        | Import rules                                       |
| `eslint-plugin-jsx-a11y`    | `^6.7.1`         | JSX accessibility rules                            |
| `eslint-plugin-react`       | `^7.32.2`        | React rules                                        |
| `eslint-plugin-react-hooks` | `^4.6.0`         | Hooks rules                                        |
| `@editorjs/simple-image`    | `^1.5.1`         | Duplicate of runtime dependency; cleanup candidate |

Some lint-related packages are currently placed in runtime `dependencies`: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier`, `eslint-plugin-flowtype`, `eslint-plugin-prettier`, and `eslint-plugin-unused-imports`. If retained, they normally belong in `devDependencies`.

## Peer dependencies and resolutions

Peer dependencies pin React 18.2.0, React DOM 18.2.0, Autoprefixer 10.4.7, and PostCSS 8.4.20. Package resolutions also pin React/React DOM 18.2.0 and Babel Loader 8.1.0.

`.npmrc` enables `legacy-peer-deps=true`, which helps this mixed-generation dependency tree install but can hide peer incompatibilities. It also disables strict engine enforcement.

## Dependency cleanup strategy

1. Capture a working build and smoke tests.
2. Remove clearly unused editor families, charts, MobX, extra date libraries, and unused MUI generations in small batches.
3. Run `npm ci`, `npm run build`, and tests after every batch.
4. Move tool-only packages to `devDependencies`.
5. Upgrade direct packages with known advisories.
6. Address the CRA/react-scripts transitive tree through a deliberate build-tool decision rather than a blind force audit fix.
7. Re-run `npm audit` and record accepted residual risk.

Do not run `npm audit fix --force` without reviewing the resulting major-version and build-tool changes.
