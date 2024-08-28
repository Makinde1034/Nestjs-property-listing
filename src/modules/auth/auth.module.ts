/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthResolver } from './resolvers';
import {
  AuthService,
  RecaptchaValidator,
  TwoFactorAuthenticationService,
} from './services';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthEventHandler } from './events/auth.event';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthMiddleware } from '../../common/interceptors/auth-middleware';
import { StaffService } from '../user/services/staff.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.jwtSecret'),
        signOptions: { expiresIn: configService.get('auth.jwtTtl') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    AuthEventHandler,
    JwtStrategy,
    RecaptchaValidator,
    TwoFactorAuthenticationService,
    StaffService,
  ],

  exports: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
