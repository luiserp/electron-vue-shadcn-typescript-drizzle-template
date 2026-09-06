import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const notesTable = sqliteTable('notes', {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  body: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
})
