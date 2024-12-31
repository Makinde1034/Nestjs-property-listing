/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

import { User } from 'src/entities';

import {
  RegisterInput,
  AuthRegisterConfirmDto,
  LoginInput,
  LoginResponse,
  BiometricLogin,
  BiometricRegister,
  PasswordResetRequestDto,
  PasswordResetDto,
  TwoFaResult,
  TwoFaLoginInput,
  ConfirmationInput,
} from '../dtos';
import { AccessTokenGuard } from '../guards';
import { AuthService } from '../services/auth.service';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Public } from '../decorators/permision.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register
   *
   * @async
   * @param {RegisterInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => User, { name: 'register' })
  @Public()
  async register(
    @Args('RegisterInput') inputDto: RegisterInput,
  ): Promise<User> {
    return await this.authService.register(inputDto);
  }

  /**
   * Register User confirmation
   *
   * @async
   * @param {AuthRegisterConfirmDto} inputDto
   * @returns {Promise<string>}
   */
  @Mutation(() => String, { name: 'registerConfirm' })
  @Public()
  async registerConfirm(
    @Args('RegisterConfirmInput') inputDto: AuthRegisterConfirmDto,
  ): Promise<string> {
    return await this.authService.registerConfirm(inputDto);
  }

  /**
   * Login User with Password
   *
   * @async
   * @param {LoginInput} loginInput
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => LoginResponse, { name: 'login' })
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Public()
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return await this.authService.login(loginInput);
  }

  /**
   * Register biometric key
   * @async
   * @param {LoginInput} inputDto
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => LoginResponse, { name: 'biometricRegister' })
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Public()
  async biometricRegister(
    @Args('RequestInput') inputDto: BiometricRegister,
  ): Promise<LoginResponse> {
    return await this.authService.biometricRegister(inputDto);
  }

  /**
   * Login using biometric method
   * @async
   * @param {LoginInput} loginInput
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => LoginResponse, { name: 'biometricLogin' })
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Public()
  async biometricLogin(
    @Args('LoginInput') loginInput: BiometricLogin,
  ): Promise<LoginResponse> {
    return await this.authService.biometricLogin(loginInput);
  }

  /**
   * Request Password Reset
   *
   * @async
   * @param {PasswordResetRequestDto} ResetInput
   * @returns {Promise<SuccessResponse>}
   */
  @Mutation(() => SuccessResponse)
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Public()
  async resetPasswordRequest(
    @Args('RequestInput') RequestInput: PasswordResetRequestDto,
  ): Promise<SuccessResponse> {
    return await this.authService.requestPasswordReset(RequestInput);
  }

  /**
   * Reset Password
   *
   * @async
   * @param {PasswordResetDto} ResetInput
   * @returns {Promise<SuccessResponse>}
   */
  @Mutation(() => SuccessResponse)
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Public()
  async resetPassword(
    @Args('ResetInput') ResetInput: PasswordResetDto,
  ): Promise<SuccessResponse> {
    return await this.authService.passwordReset(ResetInput);
  }

  /**
   * Activate 2FA
   * @async
   * @returns {Promise<TwoFaResult>}
   */
  @Query(() => TwoFaResult)
  @UseGuards(AccessTokenGuard)
  async activateTwoFa(@Context() ctx: any): Promise<TwoFaResult> {
    return await this.authService.generateTwoFactorQrcode(ctx.req.user);
  }

  /**
   * Login using two Fa
   * @async
   * @param {TwoFaLoginInput} loginInput
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => LoginResponse, { name: 'twoFaLogin' })
  @UseGuards(AccessTokenGuard)
  @Public()
  async twoFaLogin(
    @Args('LoginInput') loginInput: TwoFaLoginInput,
    @Context() ctx: any,
  ): Promise<LoginResponse> {
    return await this.authService.loginUsingTwoFactorAuthentication(
      ctx.req.user,
      loginInput,
    );
  }

  /**
   * Resend Email Confirmation
   * @async
   * @param {ConfirmationInput} RequestInput
   * @returns {Promise<SuccessResponse>}
   */
  @Mutation(() => SuccessResponse)
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Public()
  async resendEmailConfirmation(
    @Args('RequestInput') RequestInput: ConfirmationInput,
  ): Promise<SuccessResponse> {
    return await this.authService.sendEmailConfirmationLink(RequestInput);
  }
}
