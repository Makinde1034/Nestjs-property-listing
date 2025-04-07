/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  ForbiddenException,
  Global,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Company, User } from 'src/entities';
import { AppDetail, RegisterEventAction, UserStatus } from 'src/common/enums';

import { I18nService } from 'nestjs-i18n';

import * as bcrypt from 'bcrypt';

import * as crypto from 'crypto';

import { JWTPayload } from 'src/common/interface';
import { AppStrings, messagesKeys } from 'src/common/messages/app.strings';

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
  ConfirmationInput,
} from '../dtos';
import { UserRepository } from '../../user/repositories';
import { MailgunEmailService } from '../../mail/services/implementations';
import { UserService } from '../../user/services/user.service';

import { RecaptchaValidator } from './recaptcha.validator';
import { TwoFactorAuthenticationService } from './two-fa-auth.service';
import { SuccessResponse } from '../../../common/utils/success.response';
import { In } from 'typeorm';
import { ActivityEnum } from '../../../common/enums/activitys';
import { generateRandomToken } from '../../../common/utils/functions';
import { UserActionInput, StaffCreatedData } from '../../user/dtos/request';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';

@Injectable()
export class AuthService {
  private readonly frontEndUrl: string;
  private readonly adminUrl: string;
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly mailService: MailgunEmailService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
    private readonly recaptchaValidator: RecaptchaValidator,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userRepository: UserRepository,

    private readonly activityLogsService: ActivityLogService,
    private readonly usersRepository: UserRepository,
  ) {
    this.frontEndUrl = this.configService.get('FRONT_END_URL');
    this.adminUrl = this.configService.get('ADMIN_FRONTEND_URL');
  }

  /**
   * Register
   * @async
   * @param {RegisterInput} inputDto
   * @returns {Promise<User>}
   */

  async register(inputDto: RegisterInput): Promise<User> {
    try {
      // Await this.recaptchaValidator.validateRecaptcha(inputDto.recaptcha);

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

      const newUser = await this.userService.createUser(data);
      this.eventEmitter.emit(
        RegisterEventAction.USER_CREATED,
        new RegisterEventDto(newUser),
      );

      newUser.password = null;
      return newUser;
    } catch (error) {
      this.logger.log({ error });
      throw new BadRequestException(error);
    }
  }

  async resetPassword(
    requestInput: UserActionInput,
    admin: User,
  ): Promise<SuccessResponse> {
    const { userId } = requestInput;
    const notFoundIds: string[] = [];

    // Ensure userId is an array of strings
    if (!Array.isArray(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Fetch users with the provided IDs
    const users = await this.usersRepository.find({
      where: { id: In(userId) },
    });

    // Determine which user IDs were not found
    if (users.length < userId.length) {
      const foundUserIds = users.map((user) => user.id);
      notFoundIds.push(...userId.filter((id) => !foundUserIds.includes(id)));
    }

    // Concurrently update each user
    const updatePromises = users.map(async (user) => {
      // Remove the password property before saving
      delete user.password;

      // Save the user with a new password
      await this.usersRepository.save({
        ...user,
        password: generateRandomToken(),
      });

      const activityToSave = users.map((element) => {
        return {
          adminId: admin.id,
          action: ActivityEnum.UPDATED,
          details: JSON.stringify(element),
          userId: element.id,
        };
      });

      await this.activityLogsService.logActivity(activityToSave);

      // Prepare the data for sending the email
      const updatedUser: StaffCreatedData = {
        staff: user,
      };

      // Send the password email
      this.requestPasswordReset({ email: updatedUser.staff.email });
    });

    try {
      // Execute all updates concurrently
      await Promise.all(updatePromises);
    } catch (error) {
      // Log and handle any errors
      this.logger.error('Error resetting passwords:', error);
      throw new BadRequestException('Failed to reset passwords for some users');
    }

    // Handle not found IDs
    if (notFoundIds.length > 0) {
      throw new BadRequestException(
        'There was a problem performing this action on some users',
      );
    }

    // Return success response
    return new SuccessResponse(
      'You have successfully reset the passwords for the selected users',
    );
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
    await this.createDefaultNotifications(user);
  }

  /**
   * Create default notifications
   *
   * @async
   * @param {User} user
   * @returns {Promise<void>}
   */
  async createDefaultNotifications(user: User): Promise<void> {
    await this.userService.createDefaultNotifications(user);
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
   * Resend email confirmation link
   *
   * @param {ConfirmationInput} emailConfirmDto
   * @returns { Promise<string>}
   */
  async sendEmailConfirmationLink(
    emailConfirmDto: ConfirmationInput,
  ): Promise<SuccessResponse> {
    const user = await this.userService.findByEmailOrPhone(
      emailConfirmDto.email,
    );
    if (!user) {
      throw new NotFoundException(AppStrings.INVALID_USER);
    }
    if (user.verifiedAt) {
      throw new BadRequestException(AppStrings.EMAIL_ALREADY_CONFIRMED);
    }

    if (user.userType === 'company' || user.userType === 'individual') {
      await this.sendRegisterConfirmEmail(user);
    } else {
      await this.userService.sendPasswordEmailToStaff({ staff: user });
    }

    return new SuccessResponse(AppStrings.CONFIRMATION_SENT);
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
          this.i18n.t(`messages.${messagesKeys.ACCOUNT_ALREADY_CONFIRMED}`),
        );
      }

      await this.userService.removeUserConfirmation(userConfirmation.id);
      this.i18n.t(`messages.${messagesKeys.ACCOUNT_CONFIRMED_SUCCESSFULLY}`);
    }

    throw new BadRequestException(
      this.i18n.t(`messages.${messagesKeys.WRONG_CONFIRM_CODE}`),
    );
  }

  validateApp(user: User, app: AppDetail) {
    const isUnauthorized =
      ((user.userType === 'admin' || user.userType === 'staff') &&
        app !== AppDetail.ADMIN) ||
      ((user.userType === 'individual' || user.userType === 'company') &&
        app !== AppDetail.CUSTOMER);

    if (isUnauthorized) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Login user
   *
   * @async
   * @param {LoginInput} loginDto
   * @returns {Promise<LoginResponse>}
   */
  async login(loginDto: LoginInput): Promise<LoginResponse> {
    const { username, password, app } = loginDto;

    // Fetch user data and validate credentials in a single query

    // Validate the user credentials
    let user = await this.validateUserCredentials(username, password);
    // Throw unauthorized error if the credential is invalid
    if (!user) {
      throw new UnauthorizedException(AppStrings.INCORRECT_CREDENTIALS);
    } else if (!user.verifiedAt) {
      // Throw Forbidden error if the user is not verified
      throw new ForbiddenException(AppStrings.UNCONFIRMED_ACCOUNT);
    }
    // Allow Indiviudal/Company to login from Customer App
    // Allow Admin/Staff to login from Admin App
    this.validateApp(user, app);

    if (user.userType === 'admin') {
      user = await this.userRepository.findOneOrFail({
        where: { id: user.id },
        relations: ['roles', 'serviceProvider'],
      });
    }

    // Issue tokens and return user details
    const token = await this.issueTokens(user);
    return { user, token };
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
      sub: {
        userId: user.id,
        level: user.userLevel,
        isProvider: Boolean(user.serviceProvider),
      },
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

    // Create the public key object from the PEM string
    const publicKeyObject = crypto.createPublicKey({
      key: `-----BEGIN PUBLIC KEY-----\n${biometricKey}\n-----END PUBLIC KEY-----`,
      format: 'pem',
    });

    // Convert the base64-encoded signature to a buffer
    const signatureBuffer = Buffer.from(signature, 'base64');

    // Create a verifier object
    const verifier = crypto.createVerify('SHA256');
    verifier.update(payload);
    verifier.end();

    // Verify the signature using the public key
    const isVerified = verifier.verify(publicKeyObject, signatureBuffer);

    if (!isVerified) {
      throw new UnauthorizedException(
        'Unfortunately, we could not verify your Face ID authentication.',
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

    return new SuccessResponse(AppStrings.PASSWORD_RESET_SENT);
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

    let link = `${this.frontEndUrl}/reset-password?email=${email}&token=${token}`;
    if (userType === 'staff' || userType === 'admin') {
      link = `${this.adminUrl}/forgotPassword?step=createnewpassword&email=${email}&token=${token}`;
    }

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

    const salt = await bcrypt.genSalt();
    passwordResetDto.password = await bcrypt.hash(
      passwordResetDto.password,
      salt,
    );
    await this.userService.updateUser(user.id, {
      password: passwordResetDto.password,
    });

    await this.userService.removeUserConfirmation(userConfirmation.id);
    return new SuccessResponse(AppStrings.PASSWORD_RESET_SUCCEEDED);
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

    const support = await this.userRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['roles'],
    });

    const token = await this.issueTokens(support);
    return { user: support, token };
  }

  public async getUserFromAuthenticationToken(token: string) {
    const payload: JWTPayload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });

    if (payload.sub.userId) {
      return await this.userService.findUserById(payload.sub.userId);
    }
  }
}
