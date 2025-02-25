import { type ILogger } from '@/domain/logger/logger.interface';
import { type TodoRepository } from '@/domain/repositories/todoRepository.interface';

export class UpdateTodoUseCases {
  constructor(private readonly logger: ILogger, private readonly todoRepository: TodoRepository) {}

  async execute(id: number, isDone: boolean): Promise<void> {
    await this.todoRepository.updateContent(id, isDone);
    this.logger.log('updateTodoUseCases execute', `Todo ${id} have been updated`);
  }
}
