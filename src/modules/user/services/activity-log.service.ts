import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async logActivity(
    userId: string,
    action: string,
    details?: Record<string, any>,
  ) {
    await this.activityLogRepository.save({
      userId,
      action,
      details,
    });
  }

  async getLogs(filters: PaginateAndSort) {
    let whereOption = {};
    return await this.activityLogRepository.find({
      where: whereOption,
      order: { timestamp: 'DESC' },
    });
  }
}
