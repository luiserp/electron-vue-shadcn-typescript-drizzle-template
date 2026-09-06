import { eq } from "drizzle-orm";
import { AppDb } from "../../../infrastructure/database";
import { todosTable } from "../../../infrastructure/database/schema/todos";
import { Todo } from "../domain/Todo";
import { TodoRepository } from "../domain/TodoRepository";

export class SqliteTodoRepository implements TodoRepository {

    constructor(private readonly db: AppDb) {}
    
    async getAll(): Promise<Todo[]> {
        const todos = await this.db.select().from(todosTable);
        return todos.map(todo => new Todo(todo.id, todo.title, todo.description, todo.completed === 1));
    }

    async getById(id: number): Promise<Todo | null> {
        const todo = await this.db.select().from(todosTable).where(eq(todosTable.id, id)).get();
        return todo ? new Todo(todo.id, todo.title, todo.description, todo.completed === 1) : null;
    }

    async create(todo: Todo): Promise<void> {
        await this.db.insert(todosTable).values({
            title: todo.title,
            description: todo.description,
            completed: todo.completed ? 1 : 0,
            createdAt: new Date()
        }).returning();
    }

    async update(id: number, todo: Todo): Promise<void> {
        await this.db.update(todosTable).set({
            title: todo.title,
            description: todo.description,
            completed: todo.completed ? 1 : 0,
            createdAt: new Date()
        }).where(eq(todosTable.id, id));
    }

    async delete(id: number): Promise<void> {
        await this.db.delete(todosTable).where(eq(todosTable.id, id));
    }
}