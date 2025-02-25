// import { Body, Controller, Delete, Get, Inject, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
// import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';

// import { AddTodoUseCases } from '@/usecases/todo/addTodo.usecases';
// import { DeleteTodoUseCases } from '@/usecases/todo/deleteTodo.usecases';
// import { GetTodoUseCases } from '@/usecases/todo/getTodo.usecases';
// import { GetTodosUseCases } from '@/usecases/todo/getTodos.usecases';
// import { UpdateTodoUseCases } from '@/usecases/todo/updateTodo.usecases';

// import { ApiResponseType } from '../../common/swagger/response.decorator';
// import { UseCaseProxy } from '../../usecases-proxy/usecases-proxy';
// import { UsecasesProxyModule } from '../../usecases-proxy/usecases-proxy.module';
// import { AddTodoDto, UpdateTodoDto } from './todo.dto';
// import { TodoPresenter } from './todo.presenter';

// @Controller('todo')
// @ApiTags('todo')
// @ApiResponse({ status: 500, description: 'Internal error' })
// @ApiExtraModels(TodoPresenter)
// export class TodoController {
//   constructor(
//     @Inject(UsecasesProxyModule.GET_TODO_USECASES_PROXY)
//     private readonly getTodoUsecaseProxy: UseCaseProxy<GetTodoUseCases>,
//     @Inject(UsecasesProxyModule.GET_TODOS_USECASES_PROXY)
//     private readonly getAllTodoUsecaseProxy: UseCaseProxy<getTodosUseCases>,
//     @Inject(UsecasesProxyModule.PUT_TODO_USECASES_PROXY)
//     private readonly updateTodoUsecaseProxy: UseCaseProxy<updateTodoUseCases>,
//     @Inject(UsecasesProxyModule.DELETE_TODO_USECASES_PROXY)
//     private readonly deleteTodoUsecaseProxy: UseCaseProxy<deleteTodoUseCases>,
//     @Inject(UsecasesProxyModule.POST_TODO_USECASES_PROXY)
//     private readonly addTodoUsecaseProxy: UseCaseProxy<addTodoUseCases>,
//   ) {}

//   @Get('todo')
//   @ApiResponseType(TodoPresenter, false)
//   async getTodo(@Query('id', ParseIntPipe) id: number) {
//     const todo = await this.getTodoUsecaseProxy.getInstance().execute(id);
//     return new TodoPresenter(todo);
//   }

//   @Get('todos')
//   @ApiResponseType(TodoPresenter, true)
//   async getTodos() {
//     const todos = await this.getAllTodoUsecaseProxy.getInstance().execute();
//     return todos.map((todo) => new TodoPresenter(todo));
//   }

//   @Put('todo')
//   @ApiResponseType(TodoPresenter, true)
//   async updateTodo(@Body() updateTodoDto: UpdateTodoDto) {
//     const { id, isDone } = updateTodoDto;
//     await this.updateTodoUsecaseProxy.getInstance().execute(id, isDone);
//     return 'success';
//   }

//   @Delete('todo')
//   @ApiResponseType(TodoPresenter, true)
//   async deleteTodo(@Query('id', ParseIntPipe) id: number) {
//     await this.deleteTodoUsecaseProxy.getInstance().execute(id);
//     return 'success';
//   }

//   @Post('todo')
//   @ApiResponseType(TodoPresenter, true)
//   async addTodo(@Body() addTodoDto: AddTodoDto) {
//     const { content } = addTodoDto;
//     const todoCreated = await this.addTodoUsecaseProxy.getInstance().execute(content);
//     return new TodoPresenter(todoCreated);
//   }
// }
