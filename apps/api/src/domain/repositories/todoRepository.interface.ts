import { type TodoM } from '@/domain/model/todo';

export interface TodoRepository {
  deleteById(id: number): Promise<void>;
  findAll(): Promise<TodoM[]>;
  findById(id: number): Promise<TodoM>;
  insert(todo: TodoM): Promise<TodoM>;
  updateContent(id: number, isDone: boolean): Promise<void>;
}
