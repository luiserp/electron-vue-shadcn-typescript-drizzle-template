import { Todo } from "../domain/Todo";
import { TodoRepository } from "../domain/TodoRepository";

export class UpdateTodo {
  constructor(
    private readonly todoRepository: TodoRepository
  ){}

  async execute(id: number, todo: Todo): Promise<void> {
    return await this.todoRepository.update(id, todo);
  }
}