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
import { User } from 'src/entities';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RoleService } from '../../user/services';
import { PERMISSION_KEY } from '../../../common/decorator/permission';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string[]>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true; // No permission required
    }

    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user; // User object is attached to the request

    const hasPermission = await this.roleService.hasPermission(
      user,
      requiredPermission,
    );

    /**********************
     * Allow admin bypass
     **********************/
    if (user.userType === 'admin') {
      return true;
    }
    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return true;
  }
}
