import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { CreateActivityLog } from '../dto/activity-log';

@Injectable()
export class ActivityLogService {
  logger = new Logger(ActivityLogService.name);
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}
  async logActivity(createActivityLog: CreateActivityLog) {
    try {
      await this.activityLogRepository.save(createActivityLog);
    } catch (error) {
      this.logger.log(error);
    }
  }

  async getLogs(id: string) {
    try {
      let whereOption = { scopeId: id };
      return await this.activityLogRepository.find({
        where: whereOption,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.log(error);
    }
  }
}
