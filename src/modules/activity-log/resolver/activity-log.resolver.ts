import { Args, Query, Resolver } from '@nestjs/graphql';
import { ActivityLog } from '../../../entities/activity-log.entity';
import { AccessTokenGuard } from '../../auth/guards';
import { UseGuards } from '@nestjs/common';
import { ActivityLogService } from '../services/activity-log.service';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { ActivityLogsResponse } from '../dto/activity-log';
import { ActivityLogInput, AuditLogTrailsInput } from '../dto/request/activity-log';

@Resolver()
export class ActivityResolver {
  constructor(private readonly activityLogService: ActivityLogService) {}
  @Query(() => ActivityLogsResponse, { name: 'getActivityLogs' })
  @UseGuards(AccessTokenGuard)
  async getActivityLogs(
    @Args('activityLogInput') activityLogInput: ActivityLogInput,
  ) {
    return await this.activityLogService.getLogs(activityLogInput);
  }

  @Query(() => ActivityLogsResponse, { name: 'getAllActivityLogs' })
  @UseGuards(AccessTokenGuard)
  async getAllActivityLogs(
    @Args('paginateAndSort', { nullable: true })
    paginateAndSort: AuditLogTrailsInput,
  ) {
    return await this.activityLogService.getAllLogs(paginateAndSort);
  }
}
