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
  appGetInfo: 'app:get-info'
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

export type OpenDialogInput = z.infer<typeof openDialogInputSchema>
export type OpenDialogResult = z.infer<typeof openDialogResultSchema>
export type SaveDialogInput = z.infer<typeof saveDialogInputSchema>
export type SaveDialogResult = z.infer<typeof saveDialogResultSchema>
export type AppInfo = z.infer<typeof appInfoSchema>

export function parseIpc<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value)
}
