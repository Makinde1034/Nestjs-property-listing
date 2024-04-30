/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/modules/user/services/user.service';
import { PERMISSION_KEY } from 'src/common/decorator/permission';
import { User } from 'src/entities';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string[]>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true; // No permission required
    }

    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user; // User object is attached to the request

    const hasPermission = this.userService.hasPermission(
      user,
      requiredPermission,
    );
    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return true;
  }
}
