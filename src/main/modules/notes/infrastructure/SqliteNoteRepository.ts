import { eq } from 'drizzle-orm'
import { AppDb } from '../../../infrastructure/database'
import { notesTable } from '../../../infrastructure/database/schema/notes'
import { Note } from '../domain/Note'
import { NoteRepository } from '../domain/NoteRepository'

export class SqliteNoteRepository implements NoteRepository {
  constructor(private readonly db: AppDb) {}

  async getAll(): Promise<Note[]> {
    const notes = await this.db.select().from(notesTable)
    return notes.map((note) => new Note(note.id, note.title, note.body))
  }

  async create(note: Note): Promise<void> {
    await this.db.insert(notesTable).values({
      title: note.title,
      body: note.body,
      createdAt: new Date()
    })
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(notesTable).where(eq(notesTable.id, id))
  }
}
