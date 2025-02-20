import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GqlCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();
    const args = gqlCtx.getArgs();

    // Cache only queries, not mutations or subscriptions
    if (info.operation.operation !== 'query') return;

    return `${info.fieldName}:${JSON.stringify(args)}`;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();
    const operationType = info.operation.operation; // 'query', 'mutation', 'subscription'

    // If it's a mutation, clear the entire cache AFTER it executes
    if (operationType === 'mutation') {
      return next.handle().pipe(
        tap(async () => {
          console.log('Mutation detected: Clearing cache...');
          await this.cacheManager.reset(); // Clears all cache
        }),
      );
    }

    // Handle queries with caching
    const key = this.trackBy(context);
    if (key) {
      const cachedValue = await this.cacheManager.get(key);
      if (cachedValue) {
        // Parse stringified dates back to Date objects
        return of(this.parseDates(cachedValue));
      }
    }

    // Store the query result in cache
    return next.handle().pipe(
      tap(async (result) => {
        if (key && result) {
          await this.cacheManager.set(key, result);
        }
      }),
    );
  }

  private parseDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.parseDates(item));
    }
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (this.isDateString(data[key])) {
          data[key] = new Date(data[key]);
        } else {
          data[key] = this.parseDates(data[key]); // Recursively process nested objects
        }
      }
    }
    return data;
  }

  private isDateString(value: any): boolean {
    return (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)
    );
  }
}
