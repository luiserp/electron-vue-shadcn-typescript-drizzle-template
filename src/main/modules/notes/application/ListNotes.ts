import { Note } from '../domain/Note'
import { NoteRepository } from '../domain/NoteRepository'

export class ListNotes {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(): Promise<Note[]> {
    return this.noteRepository.getAll()
  }
}
