import { Args, Query, Resolver } from '@nestjs/graphql';
import { ActivityLog } from '../../../entities/activity-log.entity';
import { AccessTokenGuard } from '../../auth/guards';
import { UseGuards } from '@nestjs/common';
import { ActivityLogService } from '../services/activity-log.service';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { ActivityLogsResponse } from '../dto/activity-log';
@Resolver()
export class ActivityResolver {
  constructor(private readonly activityLogService: ActivityLogService) {}
  @Query(() => [ActivityLog], { name: 'getActivityLogs' })
  @UseGuards(AccessTokenGuard)
  async getActivityLogs(@Args('id') id: string) {
    return await this.activityLogService.getLogs(id);
  }

  @Query(() => ActivityLogsResponse, { name: 'getAllActivityLogs' })
  @UseGuards(AccessTokenGuard)
  async getAllActivityLogs(
    @Args('paginateAndSort', { nullable: true })
    paginateAndSort: PaginateAndSort,
  ) {
    return await this.activityLogService.getAllLogs(paginateAndSort);
  }
}
