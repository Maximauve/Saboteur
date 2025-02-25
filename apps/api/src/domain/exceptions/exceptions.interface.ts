export interface IFormatExceptionMessage {
  message: string;
  codeError?: number;
}

export interface IException {
  badRequestException(data: IFormatExceptionMessage): void;
  forbiddenException(data?: IFormatExceptionMessage): void;
  internalServerErrorException(data?: IFormatExceptionMessage): void;
  UnauthorizedException(data?: IFormatExceptionMessage): void;
}
