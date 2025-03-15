/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { CreateActivityLog } from '../dto/activity-log';
import { isUUID } from 'class-validator';
import {
  ActivityLogInput,
  AuditLogTrailsInput,
} from '../dto/request/activity-log';
import { Brackets } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { messagesKeys } from '../../../common/messages/app.strings';

@Injectable()
export class ActivityLogService {
  logger = new Logger(ActivityLogService.name);
  constructor(
    private readonly activityLogRepository: ActivityLogRepository,

    private readonly i18n: I18nService,
  ) {}
  async logActivity(createActivityLog: CreateActivityLog[]) {
    try {
      return await this.activityLogRepository.insert(createActivityLog);
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
            .orWhere('activityLog.auctionId = :id', { id })
            .orWhere('activityLog.attributeId = :id', { id })
            .orWhere('activityLog.listingTypeId = :id', { id })
            .orWhere('activityLog.attributeSetId = :id', { id });
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
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
      );
    }
  }

  async getAllLogs(paginateAndSort: AuditLogTrailsInput) {
    try {
      const skip = paginateAndSort.skip ?? 0;
      const take = paginateAndSort.take ?? 20;
      const { where, minDate, maxDate, userName } = paginateAndSort;

      let whereOption = {};
      if (where) {
        whereOption = {
          [`activityLogs.${where.fieldToChose}`]: where.whereParam,
        };
      }

      const query = this.activityLogRepository
        .createQueryBuilder('activityLogs')
        .leftJoinAndSelect('activityLogs.admin', 'admin')
        .leftJoinAndSelect('activityLogs.listing', 'listing')
        .leftJoinAndSelect('activityLogs.user', 'user')
        .leftJoinAndSelect('activityLogs.ticket', 'ticket')
        .skip(skip)
        .take(take);

      // Add dynamic where options
      if (Object.keys(whereOption).length) {
        query.where(whereOption);
      }

      // Apply date range filter if both minDate and maxDate are provided
      if (minDate && maxDate) {
        query.andWhere('activityLogs.createdAt BETWEEN :min AND :max', {
          min: new Date(minDate),
          max: new Date(maxDate),
        });
      }

      // Handle user name search with case-insensitive partial match
      if (userName) {
        query.andWhere(
          new Brackets((qb) => {
            qb.orWhere('admin.firstName ILIKE :param', {
              param: `%${userName}%`,
            }).orWhere('admin.lastName ILIKE :param', {
              param: `%${userName}%`,
            });
          }),
        );
      }

      const [logs, total] = await query.getManyAndCount();
      return { logs, total };
    } catch (error) {
      this.logger.error('Failed to fetch logs', error.stack);
      throw new InternalServerErrorException(
        this.i18n.t(`messages.${messagesKeys.INTERNAL_SERVER_EXCEPTION}`),
      );
    }
  }
}
