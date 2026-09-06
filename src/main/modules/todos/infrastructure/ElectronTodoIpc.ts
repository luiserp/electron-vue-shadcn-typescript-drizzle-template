import { ipcMain } from "electron";
import { IpcChannels } from "../../../../shared/ipc";
import { ListTodos } from "../application/ListTodos";
import { GetTodo } from "../application/GetTodo";
import { CreateTodo } from "../application/CreateTodo";
import { UpdateTodo } from "../application/UpdateTodo";
import { DeleteTodo } from "../application/DeleteTodo";
import { Todo } from "../domain/Todo";
import { Application } from "../../../app/container";

export function registerTodosIpc(application: Application): void {
    ipcMain.handle(IpcChannels.todosGetAll, async () => {
        return await new ListTodos(application.todos.repository).execute();
    });

    ipcMain.handle(IpcChannels.todosGetById, async (_event, id: number) => {
        return await new GetTodo(application.todos.repository).execute(id);
    });

    ipcMain.handle(IpcChannels.todosCreate, async (_event, todo: Todo) => {
        return await new CreateTodo(application.todos.repository).execute(todo);
    });
    
    ipcMain.handle(IpcChannels.todosUpdate, async (_event, id: number, todo: Todo) => {
        return await new UpdateTodo(application.todos.repository).execute(id, todo);
    });
    
    ipcMain.handle(IpcChannels.todosDelete, async (_event, id: number) => {
        return await new DeleteTodo(application.todos.repository).execute(id);
    });
}       