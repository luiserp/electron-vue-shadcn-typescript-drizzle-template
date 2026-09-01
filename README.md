# Template

Electron + Vue + TypeScript desktop starter. Use it as the base for ASA Manager and other apps.

The window is frameless (custom title bar), the UI is Vue 3 with shadcn-vue / Tailwind, and local data lives in SQLite through Drizzle in the main process.

## Stack

| Area | Package | Role |
| --- | --- | --- |
| Desktop shell | Electron 44, electron-vite 5, electron-builder | App window, build, installers |
| UI | Vue 3, Tailwind CSS 4, shadcn-vue, Reka UI, Lucide | Renderer |
| Theme | `@vueuse/core` `useColorMode` | Light / dark / system |
| Database | Drizzle ORM + `@libsql/client` (SQLite) | Local file DB in the main process |
| Tooling | TypeScript, ESLint, Prettier | Typecheck and format |

**Why libsql instead of better-sqlite3:** libsql ships prebuilt binaries. `better-sqlite3` must compile against Electron’s Node ABI and needs Visual Studio Build Tools on Windows.

## Requirements

- Node.js 22.12 or newer
- npm

## Setup

```bash
npm install
```

`postinstall` runs `electron-builder install-app-deps` so native modules match this Electron version.

## Development

```bash
npm run dev
```

This starts electron-vite:

- Main and preload compile to `out/`
- Renderer runs at `http://localhost:5173` with HMR
- Electron opens a frameless window

Renderer UI changes hot-reload. Changes in `src/main` or `src/preload` need a restart of `npm run dev`.

### Useful scripts (dev)

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the app with hot reload |
| `npm run start` | Preview the last Vite build without packaging |
| `npm run typecheck` | Typecheck main/preload and the Vue renderer |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:generate` | Create a Drizzle migration from `src/main/db/schema.ts` |
| `npm run db:studio` | Open Drizzle Studio against `./dev.db` (not the running app DB) |

DevTools: press **F12** while the app is running in development.

## Production

Build the renderer/main bundles, then package an installer.

```bash
# Typecheck + Vite production build → out/
npm run build

# Unpacked app (good for smoke-testing the package)
npm run build:unpack

# Installers
npm run build:win
npm run build:win:portable
npm run build:mac
npm run build:linux
```

| Command | Output |
| --- | --- |
| `npm run build` | Production files in `out/` (not an installer) |
| `npm run build:unpack` | Unpacked app in `dist/` |
| `npm run build:win` | Windows NSIS installer (`template-<version>-setup.exe`) |
| `npm run build:win:portable` | Single portable exe (`template-<version>-portable.exe`) |
| `npm run build:mac` | macOS DMG |
| `npm run build:linux` | AppImage, snap, and deb |

Packaging config is `electron-builder.yml`. Product name is **Template**, executable is `template`.

After install, the Windows app lives under Program Files (or the per-user install dir). The SQLite file is **not** next to the exe; it is under the user data folder (see Database).

## Project layout

```
src/
  main/                 Electron main process (Node)
    db/                 Drizzle schema, client, IPC handlers
    index.ts            Window + app lifecycle
  preload/              contextBridge APIs for the renderer
  renderer/src/         Vue app
    components/         App chrome + shadcn-vue UI
    composables/        Theme, etc.
  shared/               Code used by main and renderer
    constants.ts        APP_NAME, APP_ID
drizzle/                SQL migrations (commit these)
```

Import aliases:

- `@renderer/*` → `src/renderer/src/*`
- `@shared/*` → `src/shared/*`

## UI

- **Custom title bar** — native Windows chrome is hidden (`frame: false`). Drag the bar to move; min / max / close talk to the main process over IPC.
- **Theme** — title-bar button cycles Light → Dark → System. Preference is stored in `localStorage` (`asa-theme`).
- **shadcn-vue** — primitives go in `src/renderer/src/components/ui`.

Add a primitive:

```bash
npx shadcn-vue@latest add button
```

Path aliases for the CLI must stay in the **root** `tsconfig.json` (not only `tsconfig.web.json`), or the CLI fails with `resolvedPaths: Required`.

Sidebar **blocks** (examples like AppSidebar) are written under your `components` alias plus a nested `components/` folder. Move those files up one level after adding a block.

## Database

SQLite is opened in the **main process only**. The Vue renderer never imports Drizzle; it uses preload IPC.

| | Dev (`npm run dev`) | Production |
| --- | --- | --- |
| DB file | `./dev.db` in the project root | `%APPDATA%\Template\data.db` (Windows userData) |
| Migrations | `drizzle/` in the project root | Copied to `process.resourcesPath/drizzle` via `extraResources` |

`dev.db` is gitignored. `npm run db:studio` uses the same `./dev.db` file.

The starter schema is a `settings` key/value table.

From Vue:

```ts
await window.api.db.setSetting('example', 'hello')
const value = await window.api.db.getSetting('example')
```

From the main process:

```ts
import { getDb } from './db'
import { settings } from './db/schema'
```

### Schema changes

1. Edit `src/main/db/schema.ts`
2. Run `npm run db:generate`
3. Commit the new files under `drizzle/`
4. Restart the app — `migrate()` runs on startup

`npm run db:studio` opens the same `./dev.db` used by `npm run dev`. Packaged builds still use the userData `data.db`.

## Window and IPC

Exposed on `window.api`:

```ts
window.api.window.minimize()
window.api.window.maximize()
window.api.window.close()
await window.api.window.isMaximized()
window.api.window.onMaximizedChange((maximized) => { /* ... */ })

await window.api.db.getSetting(key)
await window.api.db.setSetting(key, value)
```

Add new main-process APIs in `src/main`, expose them in `src/preload/index.ts`, and type them in `src/preload/index.d.ts`.

## Environment variables

electron-vite loads `.env` files the Vite way. You do not need the `dotenv` package.

- Main / preload: `process.env.MY_VAR`
- Renderer: only `VITE_*` vars, via `import.meta.env.VITE_MY_VAR` (inlined at build time; never put secrets there)

In a packaged app, a `.env` file next to the exe is not loaded. Bake non-secret config at build time, or store runtime config under `userData`.

## Rename this template for a new app

1. `src/shared/constants.ts` — `APP_NAME`, `APP_ID`
2. `package.json` — `name`
3. `electron-builder.yml` — `appId`, `productName`, `executableName`
4. `src/renderer/index.html` — `<title>`
5. `dev-app-update.yml` — `updaterCacheDirName` if you use auto-update

## Notes

- Root `.npmrc` Electron mirrors were removed; they are not valid npm config keys and can block the Electron binary download.
- shadcn-vue CLI only reads path aliases from the root `tsconfig.json`.
