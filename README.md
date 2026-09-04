# Template

A desktop app starter built with Electron, Vue, and TypeScript. Fork this repo to start any project that needs a native window, a local database, and a modern UI.

## What is this, exactly?

When you run this app, three things happen at once. Electron starts a Node.js process (called **main**) that creates a native window. Inside that window, a Vue app renders your UI the same way a website would in Chrome. Between the two sits a tiny bridge script (called **preload**) that decides which Node powers the Vue side is allowed to use.

If you have built web apps before, the Vue part will feel familiar. The new part is that your "backend" is not a remote server -- it is the main process running on the same machine, with full access to the filesystem, native dialogs, and a local SQLite database. The docs in the `documentation/` folder explain this architecture in detail.

## What is included

| Area | What | Why |
| --- | --- | --- |
| Window | Electron 44, frameless with a custom title bar | Native desktop feel without the default Windows chrome |
| UI framework | Vue 3, Vue Router, Pinia | Pages, components, and shared state |
| Styling | Tailwind CSS 4, shadcn-vue, Reka UI, Lucide icons | Beautiful defaults and accessible primitives |
| Theme | `@vueuse/core` useColorMode | One-click cycle between light, dark, and system |
| Database | Drizzle ORM + libsql (SQLite) | A local file database that lives in the main process |
| IPC validation | Zod | Every message between Vue and main is validated |
| Logging | electron-log | Persistent log files under the user data folder |
| Updates | electron-updater | Checks for new versions in production builds |
| Build | electron-vite + electron-builder | Dev server with HMR, Windows/macOS/Linux installers |
| Code quality | TypeScript, ESLint, Prettier | Typecheck and format everything |

**Why libsql instead of better-sqlite3?** libsql ships prebuilt binaries. better-sqlite3 must be compiled from C++ against Electron's specific Node version, which requires Visual Studio Build Tools on Windows. libsql just works.

## Requirements

- Node.js 22.12 or newer
- npm

## Getting started

```bash
npm install
npx install-electron --no
```

The `postinstall` script runs `electron-builder install-app-deps`, which makes sure any native packages are built for the version of Node that Electron ships with (not the one you have on your PATH).

Then start the app:

```bash
npm run dev
```

This does three things behind the scenes. electron-vite compiles the main process and the preload script into `out/`, starts a Vite dev server for the Vue renderer at `http://localhost:5173`, and launches an Electron window that loads that dev server. When you edit a `.vue` file, the page hot-reloads instantly. When you edit something in `src/main` or `src/preload`, you need to restart `npm run dev` because those are separate Node processes that do not participate in Vite's hot-reload.

Press **F12** inside the running app to open Chrome DevTools.

### Commands you will use during development

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app with hot reload for the Vue side |
| `npm run start` | Preview the last production build without packaging it |
| `npm run typecheck` | Run the TypeScript compiler on both main and renderer |
| `npm run lint` | Check code style with ESLint |
| `npm run format` | Auto-format with Prettier |
| `npm run db:generate` | After editing the database schema, generate a SQL migration |
| `npm run db:studio` | Open Drizzle Studio to browse `./dev.db` |

## Building for production

The build process has two stages. First, Vite compiles everything into optimized bundles in `out/`. Then electron-builder wraps those bundles into a native installer.

```bash
npm run build                # just compile, no installer
npm run build:unpack         # compile + create an unpacked app folder in dist/
npm run build:win            # compile + Windows NSIS installer
npm run build:win:portable   # compile + single portable .exe (no install needed)
npm run build:mac            # compile + macOS DMG
npm run build:linux          # compile + AppImage, snap, and deb
```

The packaging config lives in `electron-builder.yml`. The product name is **Template** and the Windows executable is called `template.exe`. Change those when you fork this for a real app.

## Project layout

```
src/
  main/                 The Node.js backend (Electron main process)
    db/                 Database schema and connection
    ipc.ts              All IPC handlers in one place
    logger.ts           Log file setup
    errors.ts           Crash handling
    window-state.ts     Remember window size and position
    updater.ts          Auto-update check
    index.ts            App lifecycle and window creation
  preload/              The bridge between main and the Vue page
    index.ts            Defines window.api
    index.d.ts          TypeScript types so Vue sees window.api
  renderer/src/         The Vue application
    views/              Routed pages (Home, About)
    router/             Vue Router setup
    stores/             Pinia stores for shared state
    components/         Sidebar, title bar, shadcn-vue UI primitives
    composables/        Reusable logic like the theme toggle
  shared/               Code that main and preload both need
    constants.ts        App name and ID
    ipc.ts              Channel names and Zod schemas
drizzle/                SQL migration files (commit these to git)
```

When you write `import ... from '@renderer/...'` in a Vue file, that resolves to `src/renderer/src/...`. Similarly, `@shared/...` resolves to `src/shared/...`. These aliases are configured in `electron.vite.config.ts` and in the tsconfig files.

## Understanding the architecture

If you are new to Electron, the most important thing to know is that your app is not one program. It is three programs that talk to each other through messages.

The `documentation/` folder has two guides that explain this in depth:

- [**Architecture**](documentation/architecture.md) -- what main, preload, and renderer are, what each one is allowed to do, and how a message travels from a Vue button click to the filesystem and back.

- [**Adding IPC handlers**](documentation/README.md) -- a step-by-step walkthrough of how to add a new feature that needs Node access, like writing a file to disk.

Read those before adding your first IPC handler. They will save you a lot of confusion.

## The user interface

The app opens a frameless window. The native Windows title bar is gone, replaced by a custom one built in Vue. The minimize, maximize, and close buttons in the top-right corner send messages to the main process, which calls the real Electron window methods.

The theme button in the title bar cycles between light, dark, and system. The preference is saved in localStorage.

The sidebar and all UI primitives come from shadcn-vue. To add a new component:

```bash
npx shadcn-vue@latest add button
```

One quirk: the shadcn-vue CLI reads path aliases from the root `tsconfig.json`. If your aliases are only in `tsconfig.web.json`, the CLI fails with a `resolvedPaths: Required` error. This template already has the aliases in both places.

Another quirk: when you add a sidebar "block" (a pre-built example like a full sidebar layout), the CLI puts files inside `components/components/`. That extra nesting is a bug. Move them up one level after adding a block.

## The database

The app uses SQLite for local storage. The database connection is created in the main process using Drizzle ORM and libsql. Vue never touches the database directly. Instead, Vue calls `window.api.db.getSetting('key')`, which sends a message to main, and main runs the actual SQL query.

In development, the database file is `./dev.db` in the project root. In a packaged build, it moves to the user data folder -- on Windows that is `%APPDATA%\Template\data.db`.

The template ships with one table called `settings`, a simple key-value store. You can use it from Vue like this:

```ts
await window.api.db.setSetting('language', 'en')
const lang = await window.api.db.getSetting('language')
```

Or from the main process:

```ts
import { getDb } from './db'
import { todosTable } from './db/schema/todos'
```

`npm run db:studio` opens a web UI to browse `./dev.db`. This is the same file the app uses in development, so you can inspect live data.

### Create a new database table

Tables live as one file per table under `src/main/db/schema/`. [Drizzle's SQLite schema docs](https://orm.drizzle.team/docs/sql-schema-declaration) cover the column helpers.

1. Add a schema file, for example `src/main/db/schema/notes.ts`:

```ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const notesTable = sqliteTable('notes', {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
})
```

2. Register the table with the Drizzle client in `src/main/db/index.ts`. drizzle-kit already scans the whole `schema/` folder, but the running app only knows about tables you pass into `drizzle()`:

```ts
import * as schema from './schema/todos'
```

Import the new table into that `schema` object (a `schema/index.ts` barrel that re-exports every table is the usual way once you have more than one).

3. Generate a SQL migration:

```bash
npm run db:generate
```

That writes a new file under `drizzle/`. Commit the SQL and the files in `drizzle/meta/` -- those are the migration history. Do not edit old migration files after they have been applied.

4. Restart the app (`npm run dev`). `initDatabase()` in `src/main/main.ts` calls `migrate()` on startup and applies anything pending. Main-process code does not hot-reload, so a restart is required.

Vue still cannot query the new table directly. Expose it through IPC the same way `window.api.db.getSetting` works. The [Adding IPC handlers](documentation/README.md) guide covers that pipeline.

## Routing

The Vue side uses Vue Router with hash-based history (`/#/home`, `/#/about`). Hash history is required because packaged Electron apps load files from disk using `file://` URLs, and `file://` does not support the clean `/about` paths that a web server would.

To add a new page, create a `.vue` file in `src/renderer/src/views/` and register the route in `src/renderer/src/router/index.ts`.

Pinia is installed for shared state. There is one store so far: `src/renderer/src/stores/app.ts`, which holds the app name, version, and userData path.

## Desktop behavior

**Single instance.** If the user tries to launch the app a second time, the existing window comes to the front instead. This is handled by `app.requestSingleInstanceLock()` in `src/main/index.ts`.

**Window state.** The app remembers its size, position, and whether it was maximized. On every resize or move, main writes a small JSON file to the user data folder. On next launch, it reads that file and restores the window. If the saved position is off-screen (because a monitor was unplugged), it resets to the center.

**Logging.** `console.log` in a packaged app goes nowhere. This template replaces it with electron-log, which writes to `%APPDATA%\template\logs` on Windows. In development, logs also print to the terminal. The renderer has its own log transport so `console.log` in Vue code is captured too.

**Crash handling.** If the main process throws an uncaught error or an unhandled promise rejection, the error is logged and shown in a native dialog box. Without this, the app would silently crash.

**Auto-update.** electron-updater is installed and wired up, but it does nothing useful yet because the `publish` URL in `electron-builder.yml` points to `https://example.com/auto-updates`. In development, the update check is skipped entirely. When you are ready to ship, replace that URL with a real update server (or an S3 bucket, GitHub Releases, etc.) and set `autoDownload` to `true` if you want updates to install automatically.

## Calling main-process APIs from Vue

Everything Vue can do through the main process is available on `window.api`. This object is created by the preload script and is the only way Vue can reach Node.

```ts
// Window controls
window.api.window.minimize()
window.api.window.maximize()
window.api.window.close()
await window.api.window.isMaximized()
window.api.window.onMaximizedChange((maximized) => { ... })

// App info
await window.api.app.getInfo()  // { name, version, isPackaged, userDataPath }

// Database
await window.api.db.getSetting('key')
await window.api.db.setSetting('key', 'value')

// File dialogs
const opened = await window.api.dialog.open({ properties: ['openFile'] })
const saved = await window.api.dialog.save({ defaultPath: 'export.txt' })

// Open a file in the OS default app
await window.api.shell.openPath('/path/to/file')
```

The About page in the app demonstrates the dialog and shell APIs.

To add a new API, you touch four files in a specific order. The [Adding IPC handlers](documentation/README.md) guide walks through this step by step with a full example.

## Environment variables

electron-vite loads `.env` files automatically, the same way Vite does for web projects. You do not need the `dotenv` package.

- In the main process and preload: use `process.env.MY_VAR`.
- In the renderer: only variables prefixed with `VITE_` are available, via `import.meta.env.VITE_MY_VAR`. They are baked into the bundle at build time, so never put secrets there.

In a packaged app, `.env` files are not loaded from disk. Anything the packaged app needs should be baked in at build time or stored in the database.

## Starting a new project from this template

When you fork this repo for a real app, you need to replace every occurrence of the placeholder name "Template" with your own app name. Here is every file that needs a change, what to look for, and why it matters.

### 1. `src/shared/constants.ts`

```ts
export const APP_NAME = 'Template'        // → 'My App'
export const APP_ID = 'com.electron.template'  // → 'com.yourcompany.myapp'
```

`APP_NAME` is displayed in the custom title bar and used as the window title. `APP_ID` is the application user model ID on Windows -- it controls how the OS groups your app in the taskbar and in the start menu. Use a reverse-domain string that is unique to your organization.

### 2. `package.json`

```json
"name": "template"           → "my-app"
"description": "Electron..." → "Short description of your app"
"author": "example.com"      → "Your Name <you@example.com>"
```

`name` becomes the default installer filename (e.g., `my-app-1.0.0-setup.exe`). It must be lowercase with no spaces (npm rules). `author` and `description` appear in the installer metadata.

### 3. `electron-builder.yml`

```yaml
appId: com.electron.template     → com.yourcompany.myapp
productName: Template            → My App
win:
  executableName: template       → my-app
```

`appId` must match the constant in `constants.ts`. `productName` is the human-readable name shown in the Windows start menu, Add/Remove Programs, and macOS dock. `executableName` is the filename of the `.exe` on Windows (keep it lowercase with dashes, no spaces).

If you plan to publish auto-updates, replace the placeholder `publish` URL at the bottom of this file with your real update server (GitHub Releases, S3 bucket, or any static file host).

### 4. `src/renderer/index.html`

```html
<title>Template</title>    → <title>My App</title>
```

This is the HTML page title. Electron uses it as a fallback window title before Vue mounts, and it shows in the Windows taskbar if the custom title bar has not loaded yet.

### 5. `dev-app-update.yml`

```yaml
updaterCacheDirName: template-updater   → my-app-updater
```

This is only used during development to simulate the auto-updater. The name just needs to be unique so it does not collide with other Electron apps on your machine.

### 6. The app icon

Replace the files in the `resources/` folder (`icon.png`, and platform-specific icons in `build/` if they exist). electron-builder uses these to generate the installer icon, taskbar icon, and dock icon. The recommended size for `icon.png` is 512x512 or larger.

### Quick checklist

| File | What to change |
| --- | --- |
| `src/shared/constants.ts` | `APP_NAME`, `APP_ID` |
| `package.json` | `name`, `description`, `author` |
| `electron-builder.yml` | `appId`, `productName`, `executableName`, `publish` URL |
| `src/renderer/index.html` | `<title>` |
| `dev-app-update.yml` | `updaterCacheDirName` |
| `resources/` | App icon |

After making these changes, delete `node_modules` and `out/`, run `npm install`, and start fresh with `npm run dev` to make sure everything picks up the new name.

## Known quirks

- The root `.npmrc` file with Electron mirror URLs was removed. npm 11+ rejects those keys and they can silently block the Electron binary download during `npm install`.
- The shadcn-vue CLI only reads path aliases from the root `tsconfig.json`, not from `tsconfig.web.json`.
- electron-vite does not hot-reload the main process or preload. You must restart `npm run dev` after editing those files.