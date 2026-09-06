import { Todo } from "../domain/Todo";
import { TodoRepository } from "../domain/TodoRepository";

export class ListTodos {
  constructor(
    private readonly todoRepository: TodoRepository
  ) {}

  async execute(): Promise<Todo[]> {
    return await this.todoRepository.getAll();
  }
}