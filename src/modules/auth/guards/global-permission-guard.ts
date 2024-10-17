import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '../../../common/enums';
import { AppStrings } from '../../../common/messages/app.strings';
import { PERMISSION_KEY } from '../../../common/decorator/permission';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../../entities';
import { IS_PUBLIC_KEY } from '../decorators/permision.decorator';

@Injectable()
export class GlobalPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    // Skip permission check if the route is marked as public
    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const requiredPermissions =
      this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler()) || [];

    if (
      user.status === UserStatus.DISABLED ||
      user.isBlocked ||
      user.disabledAt != null
    ) {
      throw new ForbiddenException(AppStrings.SUSPENDED_ACCOUNT);
    }

    return true;
  }
}
