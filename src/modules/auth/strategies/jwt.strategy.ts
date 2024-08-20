/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWTPayload } from 'src/common/interface';
import { AppStrings } from 'src/common/messages/app.strings';
import { User } from 'src/entities';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }
  async validate(payload: JWTPayload): Promise<User> {
    const user = await this.userService.findUserById(payload.sub.userId);
    if (!user) {
      throw new UnauthorizedException();
    } else if (!user.verifiedAt) {
      throw new ForbiddenException(AppStrings.UNCONFIRMED_ACCOUNT);
    } else if (user.disabledAt) {
      throw new ForbiddenException(AppStrings.SUSPENDED_ACCOUNT);
    }
    return user;
  }
}
