import { TodoRepository } from "../domain/TodoRepository";

export class DeleteTodo {
  constructor(
    private readonly todoRepository: TodoRepository
  ) {}

  async execute(id: number): Promise<void> {
    return await this.todoRepository.delete(id);
  }
}