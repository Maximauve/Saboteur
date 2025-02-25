import { type TodoM } from '@/domain/model/todo';
import { type TodoRepository } from '@/domain/repositories/todoRepository.interface';

export class GetTodosUseCases {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(): Promise<TodoM[]> {
    return this.todoRepository.findAll();
  }
}
