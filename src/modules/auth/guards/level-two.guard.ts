/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../../entities';
import { UserLevelEnum } from '../../../common/enums';
import { AppStrings } from '../../../common/messages/app.strings';
@Injectable()
export class UserTwoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    const user: User = ctx?.req?.user; // Ensure user is correctly extracted

    const isRequiredLevel = user && user.userLevel === UserLevelEnum.LEVEL_2;
    if (!isRequiredLevel) {
      throw new ForbiddenException(AppStrings.THIS_IS_ONLY_FOR_LEVEL_TWO_USER);
    }

    return isRequiredLevel; // Ensure returning a boolean
  }
}
