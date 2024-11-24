import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TimerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        this.logger.log(
          `[${method}] ${url} - Execution time: ${executionTime}ms`,
        );
      }),
    );
  }
}
