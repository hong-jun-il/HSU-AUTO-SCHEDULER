import { Module, ValidationPipe } from '@nestjs/common';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { LoggerModule } from './modules/logger/logger.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptors';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/datasource';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CrawlerModule,
    LoggerModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ScheduleModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 6,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [],
  providers: [
    /* 
      글로벌 밸리데이션 파이프
      DI 의존성 주입을 통해 자동으로 plain object를 DTO 클래스의 인스턴스로 변환해준다
      dto에서 class validator로 유효성 검사를 하기 위해 의존성 등록 
    */
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
        });
      },
    },
    /* 
      글로벌 전체 예외 필터
      마찬가지로 DI 의존성 주입을 사용
    */
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    // response 인터셉터
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 쓰로틀링
    ...(process.env.ENV === 'dev'
      ? []
      : [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ]),
  ],
})
export class AppModule {}
