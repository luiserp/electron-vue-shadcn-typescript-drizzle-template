import { Todo } from "./Todo";

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  getById(id: number): Promise<Todo | null>;
  create(todo: Todo): Promise<void>;
  update(id: number, todo: Todo): Promise<void>;
  delete(id: number): Promise<void>;
}