import { Application, Module } from '../../app/container'
import type { TodoRepository } from './domain/TodoRepository'
import { registerTodosIpc } from './infrastructure/ElectronTodoIpc'
import { SqliteTodoRepository } from './infrastructure/SqliteTodoRepository'

export type TodosBindings = {
    repository: TodoRepository
}

declare module '../../app/container' {
    interface Application {
        todos: TodosBindings
    }
}

export function createModule(_application: Application): Module {
    return {
        name: 'todos',
        register: (application: Application) => {
            application.todos = {
                repository: new SqliteTodoRepository(application.getDb())
            }
        },
        boot: async (application: Application) => {
            registerTodosIpc(application)
        }
    }
}
