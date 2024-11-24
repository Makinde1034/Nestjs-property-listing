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
    const ctxType = context.getType<'http' | 'graphql' | 'rpc' | 'ws'>(); // Explicit type annotation

    if (ctxType === 'http') {
      // HTTP-specific logging
      const request = context.switchToHttp().getRequest();
      const method = request.method;
      const url = request.url;
      const startTime = Date.now();

      return next.handle().pipe(
        tap(() => {
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          this.logger.debug(
            `[HTTP] [${method}] ${url} - Execution time: ${executionTime}ms`,
          );
        }),
      );
    } else if (ctxType === 'graphql') {
      // GraphQL-specific logging
      const gqlContext = context.getArgs()[3];
      const operationName = gqlContext?.operation?.operation || 'Unknown';
      const startTime = Date.now();

      return next.handle().pipe(
        tap(() => {
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          this.logger.debug(
            `[GraphQL] Operation: ${operationName} - Execution time: ${executionTime}ms`,
          );
        }),
      );
    } else if (ctxType === 'rpc') {
      // RPC-specific logic
      const startTime = Date.now();

      return next.handle().pipe(
        tap(() => {
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          this.logger.debug(`[RPC] - Execution time: ${executionTime}ms`);
        }),
      );
    } else if (ctxType === 'ws') {
      // WebSocket-specific logic
      const startTime = Date.now();

      return next.handle().pipe(
        tap(() => {
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          this.logger.debug(`[WebSocket] - Execution time: ${executionTime}ms`);
        }),
      );
    } else {
      // Unknown context type
      this.logger.warn(`[Unknown] context - No specific logging implemented`);
      return next.handle();
    }
  }
}
