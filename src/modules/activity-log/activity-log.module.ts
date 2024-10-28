import { Global, Module } from '@nestjs/common';
import { ActivityLogService } from './services/activity-log.service';
import { ActivityLogRepository } from './repositories/activity-log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';
import { ActivityResolver } from './resolver/activity-log.resolver';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [ActivityLogService, ActivityLogRepository, ActivityResolver],
  exports: [ActivityLogService, ActivityLogRepository],
})
export class ActivityLogModule {}
