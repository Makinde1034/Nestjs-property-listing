import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { CreateActivityLog } from '../dto/activity-log';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { isUUID } from 'class-validator';
import { ActivityLogInput } from '../dto/request/activity-log';

@Injectable()
export class ActivityLogService {
  logger = new Logger(ActivityLogService.name);
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}
  async logActivity(createActivityLog: CreateActivityLog[]) {
    try {
      await this.activityLogRepository.insert(createActivityLog);
    } catch (error) {
      this.logger.log(error);
    }
  }
  async getLogs(activityLogInput: ActivityLogInput) {
    try {
      const { id, take, skip, fieldToFilter } = activityLogInput;
      const query = this.activityLogRepository
        .createQueryBuilder('activityLog')
        .leftJoinAndSelect('activityLog.admin', 'admin');
      if (fieldToFilter) {
        query.where(`activityLog.${fieldToFilter} = :id`, { id });
      } else if (!fieldToFilter) {
        if (isUUID(id)) {
          // Only perform these conditions if `id` is a valid UUID
          query
            .orWhere('activityLog.userId = :id', { id })
            .orWhere('activityLog.listingTypeId = :id', { id })
            .orWhere('activityLog.listingId = :id', { id })
            .orWhere('activityLog.ticketId = :id', { id })
            .orWhere('activityLog.responseTemplateId = :id', { id })
            .orWhere('activityLog.auctionId = :id', { id });
        } else {
          // Only perform these conditions if `id` is not a UUID (assumed to be an integer)
          const numericId = parseInt(id, 10);
          query
            .orWhere('activityLog.roleId = :id', { numericId })

            .orWhere('activityLog.articleId = :id', { id: numericId })
            .orWhere('activityLog.splashScreenId = :id', { id: numericId });
        }
      }

      const [logs, total] = await query

        .take(take)
        .skip(skip)
        .orderBy('activityLog.createdAt', 'DESC')

        .getManyAndCount();

      return { logs, total };
    } catch (error) {
      this.logger.error(`Error fetching logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllLogs(paginateAndSort: PaginateAndSort) {
    try {
      const skip = paginateAndSort.skip ?? 0;
      const take = paginateAndSort.take ?? 20;
      let whereOption = {};
      const { where } = paginateAndSort;

      if (where) {
        whereOption = ` activityLogs.${where.fieldToChose} IS ${where.whereParam}`;
      }
      const [logs, total] = await this.activityLogRepository
        .createQueryBuilder('activityLogs')
        .leftJoinAndSelect('activityLogs.admin', 'admin')
        .leftJoinAndSelect('activityLogs.listing', 'listing')
        .leftJoinAndSelect('activityLogs.user', 'user')
        .leftJoinAndSelect('activityLogs.ticket', 'ticket')

        .where(whereOption)
        .skip(skip)
        .take(take)
        .getManyAndCount();
      return { logs, total };
    } catch (error) {
      console.log(error);
      this.logger.log(error);
    }
  }
}
