/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { ActivityEnum } from '../../../common/enums/activitys';
import { ActivityLog } from '../../../entities/activity-log.entity';

export class CreateActivityLog {
  adminId: string;
  action: ActivityEnum;
  details?: string;
  roleId?: number;
  userId?: string;
  listingTypeId?: string;
  listingId?: string;
  responseTemplateId?: string;
  ticketId?: string;
  articleId?: number;
  auctionId?: string;
  splashScreenId?: number;
  providerId?: string;
  workflowId?: string;
  serviceId?: string;
  placement?: string;
  couponId?: string;
}

@ObjectType()
export class ActivityLogsResponse {
  @Field(() => [ActivityLog])
  logs: [ActivityLog];

  @Field()
  total: number;
}
