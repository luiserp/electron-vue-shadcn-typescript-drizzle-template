import { z } from 'zod'

export const IpcChannels = {
  windowMinimize: 'window:minimize',
  windowMaximize: 'window:maximize',
  windowClose: 'window:close',
  windowIsMaximized: 'window:isMaximized',
  windowMaximizedChanged: 'window:maximized-changed',
  dbGetSetting: 'db:get-setting',
  dbSetSetting: 'db:set-setting',
  dialogOpen: 'dialog:open',
  dialogSave: 'dialog:save',
  shellOpenPath: 'shell:open-path',
  appGetInfo: 'app:get-info',
  appTestLocalDependency: 'app:test-local-dependency',
  // Todos IPC
  todosGetAll: 'todos:get-all',
  todosGetById: 'todos:get-by-id',
  todosCreate: 'todos:create',
  todosUpdate: 'todos:update',
  todosDelete: 'todos:delete',
  notesGetAll: 'notes:get-all',
  notesCreate: 'notes:create',
  notesDelete: 'notes:delete',
  notesOpenTodoCount: 'notes:open-todo-count'
} as const

export const fileFilterSchema = z.object({
  name: z.string(),
  extensions: z.array(z.string())
})

export const openDialogInputSchema = z
  .object({
    title: z.string().optional(),
    defaultPath: z.string().optional(),
    filters: z.array(fileFilterSchema).optional(),
    properties: z.array(z.enum(['openFile', 'openDirectory', 'multiSelections'])).optional()
  })
  .optional()

export const openDialogResultSchema = z.object({
  canceled: z.boolean(),
  filePaths: z.array(z.string())
})

export const saveDialogInputSchema = z
  .object({
    title: z.string().optional(),
    defaultPath: z.string().optional(),
    filters: z.array(fileFilterSchema).optional()
  })
  .optional()

export const saveDialogResultSchema = z.object({
  canceled: z.boolean(),
  filePath: z.string().optional()
})

export const setSettingInputSchema = z.object({
  key: z.string().min(1),
  value: z.string()
})

export const appInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  isPackaged: z.boolean(),
  userDataPath: z.string()
})

export const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean()
})

export const noteSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string()
})

export type OpenDialogInput = z.infer<typeof openDialogInputSchema>
export type OpenDialogResult = z.infer<typeof openDialogResultSchema>
export type SaveDialogInput = z.infer<typeof saveDialogInputSchema>
export type SaveDialogResult = z.infer<typeof saveDialogResultSchema>
export type AppInfo = z.infer<typeof appInfoSchema>
export type Todo = z.infer<typeof todoSchema>
export type Note = z.infer<typeof noteSchema>

export function parseIpc<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value)
}
