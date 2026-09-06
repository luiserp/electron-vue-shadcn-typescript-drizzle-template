import { Todo } from "../domain/Todo";
import { TodoRepository } from "../domain/TodoRepository";

export class CreateTodo {
  constructor(
    private readonly todoRepository: TodoRepository
  ) {}

  async execute(todo: Todo): Promise<void> {
    return await this.todoRepository.create(todo);
  }
}