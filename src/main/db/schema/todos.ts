import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const todosTable = sqliteTable("todos", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  completed: integer().notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});