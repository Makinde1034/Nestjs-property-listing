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
import { AppStrings } from '../../../common/messages/app.strings';
import { IS_PUBLIC_KEY } from '../decorators/permision.decorator';
import { Reflector } from '@nestjs/core';
@Injectable()
export class TermsAndConditionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    const ctx = GqlExecutionContext.create(context).getContext();
    const user: User = ctx?.req?.user; // Ensure user is correctly

    // Skip permission check if the route is marked as public
    if (isPublic) {
      return true;
    }

    const isTermsAndConditionAccepted =
      user && user.termsOfServiceVersion === user.currentTermOfservice;
    if (!isTermsAndConditionAccepted) {
      throw new ForbiddenException(AppStrings.TERMS_AND_CONDITION);
    }

    return isTermsAndConditionAccepted; // Ensure returning a boolean
  }
}
