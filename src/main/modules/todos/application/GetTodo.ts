import { Todo } from "../domain/Todo";
import { TodoRepository } from "../domain/TodoRepository";

export class GetTodo {
  constructor(
    private readonly todoRepository: TodoRepository
  ) {}

  async execute(id: number): Promise<Todo | null> {
    return await this.todoRepository.getById(id);
  }
}