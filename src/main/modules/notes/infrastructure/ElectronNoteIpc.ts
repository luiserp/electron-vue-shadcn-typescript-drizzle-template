import { ipcMain } from 'electron'
import { IpcChannels } from '../../../../shared/ipc'
import { Application } from '../../../app/container'
import { CreateNote } from '../application/CreateNote'
import { DeleteNote } from '../application/DeleteNote'
import { ListNotes } from '../application/ListNotes'
import { Note } from '../domain/Note'

export function registerNotesIpc(application: Application): void {
  ipcMain.handle(IpcChannels.notesGetAll, async () => {
    return new ListNotes(application.notes.repository).execute()
  })

  ipcMain.handle(IpcChannels.notesCreate, async (_event, note: Note) => {
    return new CreateNote(application.notes.repository).execute(note)
  })

  ipcMain.handle(IpcChannels.notesDelete, async (_event, id: number) => {
    return new DeleteNote(application.notes.repository).execute(id)
  })

  // Example: notes may use todos because every register() has already run.
  ipcMain.handle(IpcChannels.notesOpenTodoCount, async () => {
    const todos = await application.todos.repository.getAll()
    return todos.filter((todo) => !todo.completed).length
  })
}
