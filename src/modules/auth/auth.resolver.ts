/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  RegisterInput,
  AuthRegisterConfirmDto,
  LoginInput,
  LoginResponse,
  BiometricLogin,
  BiometricRegister,
  PasswordResetRequestDto,
  PasswordResetDto,
} from './dtos';
import { User } from 'src/entities';
import { Throttle } from '@nestjs/throttler';
import { SuccessResponse } from 'src/common/response';

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
  async login(
    @Args('LoginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return await this.authService.login(loginInput);
  }

  /**
   * Register biometric key
   *
   * @async
   * @param {LoginInput} inputDto
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => String, { name: 'biometricRegister' })
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async biometricRegister(
    @Args('RegisterInput') inputDto: BiometricRegister,
  ): Promise<LoginResponse> {
    return await this.authService.biometricRegister(inputDto);
  }

  /**
   * Login using biometric method
   *
   * @async
   * @param {LoginInput} loginInput
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => String, { name: 'biometricLogin' })
  @Throttle({ default: { limit: 2, ttl: 60000 } })
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
  async resetPassword(
    @Args('ResetInput') ResetInput: PasswordResetDto,
  ): Promise<SuccessResponse> {
    return await this.authService.passwordReset(ResetInput);
  }
}
