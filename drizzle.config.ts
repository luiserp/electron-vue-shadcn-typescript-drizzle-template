import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/main/infrastructure/database/schema',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./dev.db'
  }
})
