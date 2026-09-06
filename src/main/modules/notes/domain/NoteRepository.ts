import { Note } from './Note'

export interface NoteRepository {
  getAll(): Promise<Note[]>
  create(note: Note): Promise<void>
  delete(id: number): Promise<void>
}
