# Adding a new IPC handler

This guide walks you through adding a new feature that needs the main process. If you have not read the [architecture guide](architecture.md) yet, start there -- it explains why you need to touch multiple files and what each one does.

## Why you cannot just call `fs` from Vue

In a normal Node.js app, you would `import fs from 'fs'` and write a file. In Electron, the Vue page runs inside a Chromium browser tab with **context isolation** turned on. Electron deliberately hides every Node API from the page. This means Vue cannot import `fs`, cannot import `dialog`, cannot import `app`, and cannot directly talk to the database. It can only use what the preload script put on `window.api`.

This is not a limitation of this template. It is how Electron works by design, and for good reason: if the renderer could access the filesystem, a single XSS vulnerability in your UI would give an attacker full control of the user's computer.

So every time you need Vue to do something that involves Node, you have to build a small pipeline: define a channel, write a handler in main, expose a function in preload, and call it from Vue. It sounds like a lot of steps, but once you do it once, the pattern is always the same.

## The four files you will touch

Every IPC handler involves the same four places in the codebase. Here they are, in the order you should edit them:

### 1. `src/shared/ipc.ts` -- the contract

This file is the single source of truth for channel names and the shape of the data that travels over each channel. Both main and preload import from this file. electron-vite bundles a copy into each, so the channel strings are always in sync.

### 2. `src/main/ipc.ts` -- the handler

This is where the actual work happens. When the main process receives a message on a given channel, the handler in this file runs. It has access to Node, Electron, the database -- everything.

### 3. `src/preload/index.ts` -- the bridge

This file defines the `window.api` object. Each method on that object is a thin wrapper that calls `ipcRenderer.invoke(channelName, data)` and returns the Promise. Preload does not do real work -- it just forwards the call.

### 4. `src/preload/index.d.ts` -- the types for Vue

Vue never imports the preload script. It only knows about `window.api` through TypeScript's global type declarations. If you add a method to `window.api` in the preload script but forget to add it to the `.d.ts` file, the handler will work at runtime but `vue-tsc` will show a type error. Always keep these two files in sync.

## A complete example: writing a text file

Suppose you have a Vue page where the user picks a save location using the existing `window.api.dialog.save()`, and now you want to actually write some text to that file. Vue cannot call `fs.writeFile` directly, so you need a new IPC handler.

### Step 1. Define the channel and schema

Open `src/shared/ipc.ts`. First, add a new entry to the `IpcChannels` object:

```ts
export const IpcChannels = {
  // ...all the existing channels
  fsWriteText: 'fs:write-text'
} as const
```

The naming convention is `'area:action'`. The object key is camelCase so you can import it as `IpcChannels.fsWriteText` instead of typing a raw string.

Next, add a Zod schema that describes what data this channel expects. The main process will use this schema to validate the incoming message before doing anything with it:

```ts
export const writeTextInputSchema = z.object({
  filePath: z.string().min(1),
  contents: z.string()
})

export type WriteTextInput = z.infer<typeof writeTextInputSchema>
```

Why Zod? Because the data coming from the renderer is `unknown` from main's perspective. The renderer is untrusted. A Zod schema gives you a type-safe object if the data is valid, and throws an error if it is not. This way, a bug in Vue cannot silently corrupt a file -- the handler catches it immediately.

If your handler returns structured data, add an output schema too. Look at how `appInfoSchema` is used in the existing `app:get-info` handler for an example.

### Step 2. Write the handler in main

Open `src/main/ipc.ts`. Inside the `registerIpc()` function, add your handler:

```ts
import { writeFile } from 'fs/promises'

ipcMain.handle(IpcChannels.fsWriteText, async (_event, raw: unknown) => {
  const { filePath, contents } = parseIpc(writeTextInputSchema, raw)
  await writeFile(filePath, contents, 'utf8')
})
```

A few things to notice:

- The second argument is typed as `unknown`, not as `WriteTextInput`. That is intentional. The data traveled across an IPC boundary, so TypeScript's type system does not know what it actually is. `parseIpc` (which is just a thin wrapper around `schema.parse`) validates it and gives you the typed object.

- You do not need to call `registerIpc()` yourself. The main process entry point (`src/main/index.ts`) already calls it once after `app.whenReady()`. Any handler you add inside the function will be registered automatically.

- If your handler needs to know which window sent the message (for example, to show a dialog attached to that window), use the helper that is already in the file: `const win = windowFromEvent(event)`.

### Step 3. Expose the function on `window.api`

Open `src/preload/index.ts`. Add a new method to the `api` object. Group it logically -- in this case, under an `fs` namespace:

```ts
import type { WriteTextInput } from '../shared/ipc'

const api = {
  // ...all the existing groups (app, db, dialog, shell, window)
  fs: {
    writeText: (input: WriteTextInput): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.fsWriteText, input)
  }
}
```

This function does not write the file. It sends the data to main and returns a Promise that resolves when main is done. Preload is just a messenger.

Now open `src/preload/index.d.ts` and add the TypeScript interface so Vue knows this exists:

```ts
import type { WriteTextInput } from '../shared/ipc'

export interface FsApi {
  writeText: (input: WriteTextInput) => Promise<void>
}

export interface AppApi {
  // ...all the existing groups
  fs: FsApi
}
```

If you skip this file, `window.api.fs.writeText` will work at runtime but TypeScript will underline it in red.

### Step 4. Call it from Vue

Now the pipeline is complete. From any Vue component or Pinia store:

```ts
const saved = await window.api.dialog.save({ defaultPath: 'note.txt' })
if (!saved.canceled && saved.filePath) {
  await window.api.fs.writeText({
    filePath: saved.filePath,
    contents: 'Hello from Vue!'
  })
}
```

That is it. Vue calls `window.api.fs.writeText()`. Preload forwards it as `ipcRenderer.invoke('fs:write-text', { filePath, contents })`. Main receives the message, validates the payload with Zod, writes the file, and the Promise resolves.

## Following an existing handler through the code

If you want to see this pattern in practice, trace the `app:get-info` handler through the codebase. It touches the same four files:

1. **Shared** (`src/shared/ipc.ts`): `IpcChannels.appGetInfo` is `'app:get-info'`. The `appInfoSchema` describes the returned object (name, version, isPackaged, userDataPath).

2. **Main** (`src/main/ipc.ts`): `ipcMain.handle(IpcChannels.appGetInfo, ...)` calls `app.getName()`, `app.getVersion()`, etc., validates the result with `appInfoSchema`, and returns it.

3. **Preload** (`src/preload/index.ts`): `window.api.app.getInfo()` calls `ipcRenderer.invoke(IpcChannels.appGetInfo)`.

4. **Vue** (`src/renderer/src/stores/app.ts`): the Pinia store calls `window.api.app.getInfo()` and saves the result in reactive state.

Open those four spots side by side in your editor. Once you see how they connect, every future handler will be a copy of this pattern.

## Common mistakes

**Calling `ipcRenderer` from a Vue file.** This does not work. Context isolation means the renderer page has no access to `ipcRenderer`. The only way to send messages is through the functions that preload put on `window.api`.

**Importing Node modules in the renderer.** `import fs from 'fs'` in a `.vue` file will fail. If you need filesystem access, create an IPC handler for it.

**Hardcoding channel strings.** If you type `'fs:write-text'` in main and `'fs:writeText'` in preload, the handler silently does nothing. Always import from `IpcChannels` so TypeScript catches typos.

**Skipping Zod validation.** It might seem unnecessary for a simple string, but the renderer is untrusted by design. Zod is the type boundary between the two processes. Without it, a bug in Vue could pass garbage to `fs.writeFile`.

**Forgetting the `.d.ts` file.** The handler works at runtime but TypeScript does not know `window.api.fs` exists. Vue-tsc fails, and you get no autocomplete.

**Expecting hot reload on main or preload.** Vite only hot-reloads the renderer. After editing anything in `src/main` or `src/preload`, you must restart `npm run dev`.

## After adding a handler

Run the type checker to make sure all four files are in sync:

```bash
npm run typecheck
```

Then restart `npm run dev` (because main and preload do not hot-reload) and call your new `window.api` method from a Vue page or store.
