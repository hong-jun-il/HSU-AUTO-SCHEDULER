import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { LoggerService } from 'src/modules/logger/logger.service';
import { ResponseType } from '../types/response.type';

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseObj: ResponseType = {
      success: false,
      statusCode: 500,
      timeStamp: new Date().toISOString(),
      path: request.url,
      message: '',
      error: 'INTERNAL_SERVER_ERROR',
    };

    if (exception instanceof HttpException) {
      responseObj.statusCode = exception.getStatus();
      responseObj.message = exception.message;
      responseObj.error = exception.getResponse()['code'];
    } else {
      responseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      responseObj.message = 'Internal Server Error';
    }

    response.status(responseObj.statusCode).json(responseObj);

    this.logger.error(
      `[${request.method}] ${responseObj.statusCode} - (${responseObj.path}): ${responseObj.message}`,
      AllExceptionFilter.name,
    );

    super.catch(exception, host);
  }
}
