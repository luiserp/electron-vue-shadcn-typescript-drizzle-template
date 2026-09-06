import { Note } from '../domain/Note'
import { NoteRepository } from '../domain/NoteRepository'

export class CreateNote {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(note: Note): Promise<void> {
    return this.noteRepository.create(note)
  }
}
