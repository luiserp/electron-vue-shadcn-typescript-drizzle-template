import { NoteRepository } from '../domain/NoteRepository'

export class DeleteNote {
  constructor(private readonly noteRepository: NoteRepository) {}

  async execute(id: number): Promise<void> {
    return this.noteRepository.delete(id)
  }
}
