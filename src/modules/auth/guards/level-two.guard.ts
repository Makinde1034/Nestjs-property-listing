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
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/permision.decorator';
@Injectable()
export class UserTwoGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context).getContext();
    const user: User = ctx?.req?.user; // Ensure user is correctly

    // Skip permission check if the route is marked as public

    const isRequiredLevel =
      (user && user.userLevel === UserLevelEnum.LEVEL_2) ||
      user.userType == 'admin';
    if (!isRequiredLevel) {
      throw new ForbiddenException(AppStrings.THIS_IS_ONLY_FOR_LEVEL_TWO_USER);
    }

    return isRequiredLevel; // Ensure returning a boolean
  }
}
