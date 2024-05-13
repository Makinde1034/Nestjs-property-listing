/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import {
  RegisterEventDto,
  RegisterInput,
  LoginInput,
  LoginResponse,
  AuthRegisterConfirmDto,
  TokenType,
  BiometricLogin,
  BiometricRegister,
  PasswordResetDto,
  PasswordResetRequestDto,
  TwoFaResult,
  TwoFaLoginInput,
} from '../dtos';
import { Company, User } from 'src/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterEventAction, UserStatus } from 'src/common/enums';
import { NodeMailerEmailService } from '../../mail/services/implementations';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/common/interface';
import { AppStrings } from 'src/common/messages/app.strings';
import { SuccessResponse } from 'src/common/response';
import { RecaptchaValidator } from './recaptcha.validator';
import { TwoFactorAuthenticationService } from './two-fa-auth.service';
import { UserRepository } from '../../user/repositories';

@Injectable()
export class AuthService {
  private readonly frontEndUrl: string;
  private readonly adminUrl: string;
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly mailService: NodeMailerEmailService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
    private readonly recaptchaValidator: RecaptchaValidator,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userRepository: UserRepository,
  ) {
    this.frontEndUrl = this.configService.get('FRONT_END_URL');
    this.adminUrl = this.configService.get('ADMIN_FRONTEND_URL');
  }

  /**
   * Register
   *
   * @async
   * @param {RegisterInput} inputDto
   * @returns {Promise<User>}
   */
  async register(inputDto: RegisterInput): Promise<User> {
    try {
      await this.recaptchaValidator.validateRecaptcha(inputDto.recaptcha);
      // Check for user with same email or phone
      const existingUser = await this.userService.findByEmailOrPhone(
        inputDto.email,
      );

      // Throw an exception for already used email
      if (existingUser) {
        throw new HttpException('User Already Exist', HttpStatus.CONFLICT);
      }

      let company: Company | null;
      if (inputDto.userType === 'company') {
        company = {
          ...inputDto.company,
        } as Company;
      }

      // Create user
      const data: Partial<User> = {
        ...inputDto,
        company,
      };
      const newUser = await this.userRepository.create(data);
      this.eventEmitter.emit(
        RegisterEventAction.USER_CREATED,
        new RegisterEventDto(newUser),
      );
      return newUser;
    } catch (error) {
      this.logger.log({ error });
      throw new BadRequestException(error);
    }
  }

  /**
   * Send Confirmation Email
   *
   * @async
   * @param {User} user
   * @returns {Promise<void>}
   */
  async sendEmailConfirmation(user: User): Promise<void> {
    await this.sendRegisterConfirmEmail(user);
  }

  /**
   * Send confirmation email
   *
   * @param {User} user
   */
  async sendRegisterConfirmEmail(user: User) {
    const { email } = user;
    const { token } = await this.userService.generateUserConfirmation(user);

    const link = `${this.frontEndUrl}/email-confirmation?email=${email}&token=${token}`;

    await this.mailService.sendUserConfirmation(user, link);
  }

  /**
   * Confirm registered user
   *
   * @async
   * @param {AuthRegisterConfirmDto} authRegisterConfirmDto
   * @returns {string}
   */
  async registerConfirm(
    authRegisterConfirmDto: AuthRegisterConfirmDto,
  ): Promise<string> {
    const { email, token } = authRegisterConfirmDto;
    const userConfirmation = await this.userService.findTokenConfirmation(
      email,
      token,
    );

    if (userConfirmation) {
      const { user } = userConfirmation;
      // If user already complete account setup
      // FE: need to redirect to /login
      if (user.verifiedAt) {
        throw new BadRequestException(
          this.i18n.t('messages.register.REGISTRATION_ALREADY_COMPLETED'),
        );
      }
      if (this.userService.validateUserConfirmation(userConfirmation, token)) {
        await this.userService.updateUser(user.id, {
          verifiedAt: new Date(),
          status: UserStatus.VERIFIED,
        });
        await this.userService.removeUserConfirmation(userConfirmation.id);
        return this.i18n.translate(
          'messages.register.ACCOUNT_CONFIRMED_SUCCESSFULLY',
        );
      }
    }
    throw new BadRequestException(
      this.i18n.t('messages.register.WRONG_CONFIRM_CODE'),
    );
  }

  /**
   * Login user
   *
   * @async
   * @param {LoginInput} loginDto
   * @returns {Promise<LoginResponse>}
   */
  async login(loginDto: LoginInput): Promise<LoginResponse> {
    const { username, password } = loginDto;
    // Validate the user credentials
    let user = await this.validateUserCredentials(username, password);
    // Throw unauthorized error if the credential is invalid
    if (!user) {
      throw new UnauthorizedException(AppStrings.INCORRECT_CREDENTIALS);
    } else if (!user.verifiedAt) {
      // Throw Forbidden error if the user is not verified
      throw new ForbiddenException(AppStrings.UNCONFIRMED_ACCOUNT);
    }

    if (user.userType === 'admin') {
      user = await this.userRepository.findById(user.id, ['roles']);
    }

    // Return the user and the access tokens
    return {
      user,
      token: await this.issueTokens(user),
    };
  }

  /**
   * Validate user password
   *
   * @async
   * @param {string} username
   * @param {string} password
   * @returns {Promise<User | null>}
   */
  async validateUserCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    // Find the user by the email
    const user = await this.userService.findByEmailOrPhone(username);

    // Return null if user is not found
    if (!user) {
      return null;
    }

    // Compare the saved hashed password to the hash of the incoming password
    const isMatch = await bcrypt.compare(password, user.password);

    // Return user if password match
    if (isMatch) {
      return user;
    }
    // Return null if password do not match
    return null;
  }

  /**
   * Get JWT token
   *
   * @async
   * @param {User} user
   * @returns {TokenType}
   */
  async issueTokens(user: User): Promise<TokenType> {
    // JWT payload to identify the user
    const payload: JWTPayload = {
      username: user.email,
      sub: user.id,
    };

    // Generate JWT tokens for access and refresh tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_TTL'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_TTL'),
      }),
    ]);

    // Return the tokens
    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    };
  }

  /**
   * Biometric Login
   *
   * @async
   * @param {BiometricRegister} inputDto
   * @returns {Promise<LoginResponse>}
   */
  async biometricRegister(inputDto: BiometricRegister): Promise<LoginResponse> {
    const { userId, publicKey } = inputDto;

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(
        'Something went wrong during your Face ID authentication.',
      );
    }

    await this.userService.updateUser(userId, { biometricKey: publicKey });

    // Return the user and the access tokens
    return {
      user,
      token: await this.issueTokens(user),
    };
  }

  /**
   * Biometric Login
   *
   * @async
   * @param {BiometricLogin} loginDto
   * @returns {Promise<LoginResponse>}
   */
  async biometricLogin(loginDto: BiometricLogin): Promise<LoginResponse> {
    const { signature, payload } = loginDto;
    const userId = payload.split('__')[0];
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(
        'Something went wrong during your Face ID authentication.',
      );
    }
    // This is the public key that was saved earlier
    const { biometricKey } = user;
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(payload);
    const isVerified = verifier.verify(
      `-----BEGIN PUBLIC KEY-----\n${biometricKey}\n-----END PUBLIC KEY-----`,
      signature,
      'base64',
    );
    if (!isVerified) {
      throw new UnauthorizedException(
        'Unfortunetely we could not verify your Face ID authentication',
      );
    }
    // Return the user and the access tokens
    return {
      user,
      token: await this.issueTokens(user),
    };
  }

  /**
   * Request password reset
   *
   * @async
   * @param {PasswordResetRequestDto} phone
   * @returns {Promise<SuccessResponse>}
   */
  async requestPasswordReset({
    email,
  }: PasswordResetRequestDto): Promise<SuccessResponse> {
    const user = await this.userService.findByEmailOrPhone(email);
    if (!user) {
      // Review: We shouldn't return any information that tell user not found for security
      throw new NotFoundException(AppStrings.USER_NOT_FOUND);
    }

    // Send Phone OTP Event
    this.eventEmitter.emit(
      RegisterEventAction.SEND_PASSWORD_RESET,
      new RegisterEventDto(user),
    );

    return {
      message: AppStrings.PASSWORD_RESET_SENT,
    };
  }

  /**
   * Send reset password email
   *
   * @async
   * @param {User} user
   * @returns {Promise<void>}
   */
  async generateAndSendPasswordResetToken(user: User): Promise<void> {
    const { email, userType } = user;
    const { token } = await this.userService.generateUserConfirmation(user);

    const url = userType === 'staff' ? 'forgotPassword' : 'reset-password';

    const link = `${this.frontEndUrl}/${url}?email=${email}&token=${token}${userType === 'staff' ? '&step=createnewpassword' : ''}`;

    await this.mailService.sendPasswordResetEmail(user, link);
  }

  /**
   * Reset Password
   *
   * @async
   * @param {PasswordResetDto} passwordResetDto
   * @returns {Promise<SuccessResponse>}
   */
  async passwordReset(
    passwordResetDto: PasswordResetDto,
  ): Promise<SuccessResponse> {
    const { token, email } = passwordResetDto;
    const userConfirmation = await this.userService.findTokenConfirmation(
      email,
      token,
    );
    if (!userConfirmation) {
      throw new BadRequestException(AppStrings.WRONG_CONFIRM_CODE);
    }
    const { user } = userConfirmation;
    await this.userService.updateUser(user.id, {
      password: passwordResetDto.password,
    });

    await this.userService.removeUserConfirmation(userConfirmation.id);
    return {
      message: AppStrings.PASSWORD_RESET_SUCCEEDED,
    };
  }

  /**
   * Generate QRCode For TwoFa
   *
   * @async
   * @param {User} user
   * @returns {Promise<TwoFaResult>}
   */
  async generateTwoFactorQrcode(user: User): Promise<TwoFaResult> {
    try {
      const secret =
        this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
          user.email,
        );
      const name = `${user.firstName} ${user.lastName}`;
      const qrcode =
        await this.twoFactorAuthenticationService.generateTwoFactorOtpUrl(
          user.email,
          name,
          secret,
        );

      await this.userService.updateUser(user.id, {
        twoFactorAuthenticationSecret: secret,
      });

      return { qrcodeImage: qrcode, user };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Login using TwoFa
   *
   * @async
   * @param {User} user
   * @param {TwoFaLoginInput} input
   * @returns {Promise<LoginResponse>}
   */
  async loginUsingTwoFactorAuthentication(
    user: User,
    input: TwoFaLoginInput,
  ): Promise<LoginResponse> {
    if (!user.twoFactorAuthenticationSecret) {
      throw new ForbiddenException(AppStrings.TWO_FA_NOT_ENABLED);
    }
    const isValidToken =
      this.twoFactorAuthenticationService.validateTwoFactorAuthenticationToken(
        input.token,
        user.twoFactorAuthenticationSecret,
      );

    if (!isValidToken) {
      throw new UnauthorizedException(AppStrings.INCORRECT_TOKEN);
    }

    if (!user.isTwoFactorAuthenticationEnabled) {
      await this.userService.updateUser(user.id, {
        isTwoFactorAuthenticationEnabled: true,
      });
    }

    const support = await this.userRepository.findById(user.id, ['roles']);

    const token = await this.issueTokens(support);
    return { user: support, token };
  }
}
