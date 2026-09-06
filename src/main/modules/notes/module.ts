import { Application, Module } from '../../app/container'
import type { NoteRepository } from './domain/NoteRepository'
import { registerNotesIpc } from './infrastructure/ElectronNoteIpc'
import { SqliteNoteRepository } from './infrastructure/SqliteNoteRepository'

export type NotesBindings = {
  repository: NoteRepository
}

declare module '../../app/container' {
  interface Application {
    notes: NotesBindings
  }
}

export function createModule(_application: Application): Module {
  return {
    name: 'notes',
    register: (application: Application) => {
      application.notes = {
        repository: new SqliteNoteRepository(application.getDb())
      }
    },
    boot: async (application: Application) => {
      registerNotesIpc(application)
    }
  }
}
