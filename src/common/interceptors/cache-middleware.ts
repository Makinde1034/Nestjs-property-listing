import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class GqlCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();
    const args = gqlCtx.getArgs();

    // Generating cache key from query and arguments
    const key = `${info.fieldName}:${JSON.stringify(args)}`;
    return key;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.trackBy(context); // Generate cache key

    if (key) {
      const cachedValue = await this.cacheManager.get(key);
      if (cachedValue) {
        // If cache hit, return cached value wrapped in an observable
        return new Observable((observer) => {
          observer.next(cachedValue);
          observer.complete();
        });
      }
    }

    // Proceed with the next handler and subscribe to the result
    const result$ = next.handle();

    // Cache the result once it is available
    result$.subscribe({
      next: async (result) => {
        if (key && result) {
          // Cache the result only if there's a valid key and result
          await this.cacheManager.set(key, result, { ttl: 300 }); // TTL is optional
        }
      },
      error: (err) => {
        console.error('Error during GraphQL execution:', err);
      },
    });

    // Return the observable itself
    return result$;
  }
}
