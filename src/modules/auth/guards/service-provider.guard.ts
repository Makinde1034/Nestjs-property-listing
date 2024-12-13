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
@Injectable()
export class ServiceProviderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    const user: User = ctx?.req?.user; // Ensure user is correctly extracted

    const isRequiredInterface =
      (user && user.interface === UserInterfaceType.SERVICE_PROVIDER) ||
      user.userType == 'admin';

    if (!isRequiredInterface) {
      throw new ForbiddenException(AppStrings.YOU_ARE_NOT_A_SERVICE_PROVIDER);
    }

    return isRequiredInterface; // Ensure returning a boolean
  }
}
