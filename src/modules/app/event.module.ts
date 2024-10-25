import { Global, Module } from '@nestjs/common';
import { SseService } from './client.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}
