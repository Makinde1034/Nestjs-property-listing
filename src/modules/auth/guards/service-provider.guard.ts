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
import { UserInterfaceType } from '../../../common/enums';
import { AppStrings } from '../../../common/messages/app.strings';
import { IS_PUBLIC_KEY } from '../decorators/permision.decorator';
import { Reflector } from '@nestjs/core';
@Injectable()
export class ServiceProviderGuard implements CanActivate {
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

    // Ensure user is correctly extracted
    const isRequiredInterface =
      (user && user?.interface === UserInterfaceType.SERVICE_PROVIDER) ||
      user?.userType == 'admin';

    if (!isRequiredInterface) {
      throw new ForbiddenException(AppStrings.YOU_ARE_NOT_A_SERVICE_PROVIDER);
    }

    return isRequiredInterface; // Ensure returning a boolean
  }
}
