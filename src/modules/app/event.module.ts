import { Global, Module } from '@nestjs/common';
import { SseService } from './client.service';
@Global() // This makes the module available across the app
@Module({
  providers: [SseService], // Provide SseService
  exports: [SseService], // Export it so other modules can use it
})
export class SseModule {} // This can be AppModule or a separate module
