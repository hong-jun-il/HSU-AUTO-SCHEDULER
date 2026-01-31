import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResponseType } from '../types/response.type';
import { Response } from 'express';

type ApiResponseInput<T> = {
  message?: string;
  data?: T | string;
};

@Injectable()
// NestInterceptor의 제네릭 첫번째 인자는 Controller에서 반환하는 값, 두번째 인자는 해당 인터셉터에서 반환할 값
export class ResponseInterceptor<T>
  implements NestInterceptor<ApiResponseInput<T>, ResponseType>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<ApiResponseInput<T>>,
  ): Observable<ResponseType> | Promise<Observable<ResponseType>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((res) => ({
        success: true,
        statusCode: response.statusCode,
        message: res.message ?? '요청이 성공적으로 처리되었습니다',
        data: res.data ?? null,
      })),
    );
  }
}
