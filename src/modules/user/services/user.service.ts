/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  NationalIdentityRepository,
  UserConfirmationRepository,
  UserRepository,
} from '../repositories';
import type {
  TokenConfirmation,
  User,
  UserNotificationPreference,
} from '../../../entities';
import { DeepPartial, FindOptionsWhere, In, LessThan } from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import { addHours, isPast } from 'date-fns';
import {
  ImageResponse,
  NotificationPrefenceInput,
  UserProfileInput,
  UserActionInput,
  PasswordInput,
} from '../dtos';
import { StorageService } from '../../file-handler/services/storage.service';

import { NationalIdentityType, UserStatus } from '../../../common/enums';

import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  NotificationScopeRepository,
  UserNotificationRepository,
} from '../repositories/notification.repository';
import { generateRandomToken } from '../../../common/utils/functions';
import { AppStrings } from '../../../common/messages/app.strings';
import {
  SuccessResponse,
  SuccessResponseWithDataPayload,
} from '../../../common/utils/success.response';

@Injectable()
export class UserService {
  private readonly frontEndUrl: string;
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly tokenRepository: UserConfirmationRepository,
    private readonly nationalIdentityRepository: NationalIdentityRepository,
    private readonly storageService: StorageService,
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly configService: ConfigService,
  ) {
    this.frontEndUrl = this.configService.get('ADMIN_FRONTEND_URL');
  }
  logger = new Logger(UserService.name);

  /**
   * Create User
   * @async
   * @param {Partial<User>} userData
   * @returns {Promise<User>}
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const salt = await bcrypt.genSalt();
    userData.password = await bcrypt.hash(userData.password, salt);
    const user = await this.usersRepository.save(userData);
    user.password = null;
    return user;
  }

  /**
   * Find by email or phone
   *
   * @async
   * @param {string} username
   * @returns {(Promise<User | null>)}
   */
  async findByEmailOrPhone(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: [{ email: username }, { phone: username }],
    });
  }

  /**
   * Find user
   *
   * @async
   * @param {FindOptionsWhere<User> | FindOptionsWhere<User>[]} userData
   * @returns {Promise<User>}
   */
  async findUser(
    userData: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User> {
    return await this.usersRepository.findOne({ where: userData });
  }

  /**
   * Find user
   *
   * @async
   * @param {string} id
   * @returns {Promise<User>}
   */
  async findUserById(id: string, relations?: string[]): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations,
    });
    return user;
  }

  /**
   * Generate user confirmation code
   *
   * @async
   * @param {User} user
   * @returns {Promise<TokenConfirmation>}
   */
  async generateUserConfirmation(user: User): Promise<TokenConfirmation> {
    // When we have a valid unused confirm code, return it
    const existingUserConfirmation = await this.findExistingUserConfirmation(
      user.email,
    );
    if (
      existingUserConfirmation &&
      !this.isUserConfirmationExpired(existingUserConfirmation)
    ) {
      return existingUserConfirmation;
    }
    try {
      return await this.tokenRepository.create({
        user,
        token: generateRandomToken(),
        expiredAt: addHours(new Date(), 1),
      });
    } catch (e: any) {
      // If the generated code exists, try another one
      if (e.driverError?.code === PostgresError.UNIQUE_VIOLATION) {
        return await this.generateUserConfirmation(user);
      }
      throw e;
    }
  }

  /**
   * Find latest user confirmation
   *
   * @async
   * @param {string} email
   * @returns {Promise<TokenConfirmation>}
   */
  async findExistingUserConfirmation(
    email: string,
  ): Promise<TokenConfirmation> {
    return await this.tokenRepository.findOne({
      relations: { user: true },
      where: { user: { email }, expiredAt: LessThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Validate user confirmation expiry
   *
   * @param {TokenConfirmation} userConfirmation
   * @returns {boolean}
   */
  isUserConfirmationExpired(userConfirmation: TokenConfirmation): boolean {
    return isPast(userConfirmation.expiredAt);
  }

  /**
   * Validate user confirmation code validity and compare provided code (optional)
   *
   * @param {TokenConfirmation} userConfirmation
   * @param {string} providedCode
   * @returns {boolean}
   */
  validateUserConfirmation(
    userConfirmation: TokenConfirmation,
    providedCode: string,
  ): boolean {
    const isCodeExpired = this.isUserConfirmationExpired(userConfirmation);

    if (userConfirmation.token === providedCode && !isCodeExpired) {
      return true;
    }
    return false;
  }

  /**
   * Remove User Confirmation
   *
   * @async
   * @param {string} id
   * @returns {Promise<TokenConfirmation>}
   */
  async removeUserConfirmation(id: string): Promise<void> {
    await this.tokenRepository.delete(id);
  }

  /**
   * Find user confirmation
   *
   * @async
   * @param {string} email
   * @param {string} token
   * @returns {Promise<TokenConfirmation>}
   */
  async findTokenConfirmation(
    email: string,
    token: string,
  ): Promise<TokenConfirmation> {
    return await this.tokenRepository.findOne({
      relations: { user: true },
      where: { user: { email }, token },
    });
  }

  /**
   * Update user entity
   *
   * @async
   * @param {string} id
   * @returns {Promise<User>}
   */
  async updateUser(id: string, data: DeepPartial<User>): Promise<User> {
    const { affected } = await this.usersRepository.update(id, data);
    if (affected) {
      return this.usersRepository.findOneBy({ id });
    }
  }

  /**
   * Update User Profile
   *
   * @async
   * @param {User} user
   * @param {UserProfileInput} data
   * @returns {Promise<User>}
   */
  async updateProfile(user: User, data: UserProfileInput): Promise<User> {
    const { nationalIdentity } = data;

    // Check if the national identity has expired
    if (
      nationalIdentity?.dateOfExpiry &&
      isPast(new Date(nationalIdentity.dateOfExpiry))
    ) {
      throw new BadRequestException(AppStrings.EXPIRED_NATIONAL_ID);
    }

    // Validate the national identity if provided
    if (nationalIdentity) {
      const { type, identityNumber } = nationalIdentity;
      const isInvalidIdentityNumber =
        (type === NationalIdentityType.IQAMA &&
          !identityNumber.startsWith('2')) ||
        (type === NationalIdentityType.NATIONAL_ID &&
          !identityNumber.startsWith('1')) ||
        identityNumber.length !== 10;

      if (isInvalidIdentityNumber) {
        throw new BadRequestException(AppStrings.INVALID_NATIONAL_ID);
      }
      const userData = await this.usersRepository.findOne({
        where: { id: user.id },
        relations: ['nationalIdentity'],
      });

      if (userData.nationalIdentity) {
        await this.nationalIdentityRepository.update(
          userData.nationalIdentity.id,
          { ...nationalIdentity },
        );
      } else {
        await this.nationalIdentityRepository.create({
          ...nationalIdentity,
          user,
        });
      }

      // Remove nationalIdentity from data to prevent updating it in the user table
      delete data.nationalIdentity;
    }

    const updateData = { ...data } as Partial<User>;
    await this.usersRepository.update(user.id, updateData);

    // Return the updated user
    return await this.usersRepository.findOneByOrFail({ id: user.id });
  }

  /**
   * Update User Password
   *
   * @async
   * @param {User} user
   * @param {PasswordInput} data
   * @returns {Promise<User>}
   */
  async changePassword(user: User, data: PasswordInput): Promise<User> {
    const { oldPassword, newPassword } = data;

    // Compare the saved hashed password to the hash of the oldPassword
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException(AppStrings.INCORRECT_OLD_PASSWORD);
    }

    const { affected } = await this.usersRepository.update(user.id, {
      password: newPassword,
    });
    if (affected) {
      return await this.usersRepository.findOneByOrFail({ id: user.id });
    }
  }

  /**
   * Create Default notifications for user
   *
   * @async
   * @param {User} user
   * @returns {Promise<void>}
   */
  async createDefaultNotifications(user: User): Promise<void> {
    const scopes = await this.notificationScopeRepository.find();
    await Promise.all(
      scopes.map(async (scope) => {
        const data: Partial<UserNotificationPreference> = {
          user,
          scope,
        };
        await this.userNotificationRepository.create(data);
      }),
    );
  }

  /**
   * Update User Profile
   *
   * @async
   * @param {User} user
   * @param {NotificationPrefenceInput} data
   * @returns {Promise<User>}
   */
  async updateNotificationPreference(
    user: User,
    data: NotificationPrefenceInput,
  ): Promise<User> {
    const { notificationPreferences } = data;
    const scopeIds = notificationPreferences.map((item) => item.scopeId);
    const scopes = await this.notificationScopeRepository.find({
      where: { id: In([...scopeIds]) },
    });
    const preferencesData = scopes
      .map((scope) => {
        const scopeItem = notificationPreferences.find(
          (item) => item.scopeId === scope.id,
        );
        if (!scopeItem) {
          return null;
        }
        delete scopeItem.scopeId;
        return {
          scope,
          user,
          ...scopeItem,
        };
      })
      .filter((item) => item !== null);

    // Save preferences
    const { affected } = await this.usersRepository.update(user.id, {
      notificationPreference: preferencesData,
    });
    if (affected) {
      return await this.usersRepository.findOneByOrFail({ id: user.id });
    }
  }

  /**
   * Update User's Profile picture
   *
   * @async
   * @param {User} user
   * @param {Express.Multer.File} image
   * @returns {Promise<ImageResponse>}
   */
  async updateProfilePicture(
    user: User,
    image: Express.Multer.File,
  ): Promise<ImageResponse> {
    if (!image) {
      throw new BadRequestException(AppStrings.NO_IMAGE_SELECTED);
    }
    // Upload profile image
    const imageurl = await this.storageService.upload(image);
    await this.usersRepository.update(user.id, {
      profilePhoto: imageurl,
    });

    return { url: imageurl };
  }

  async blockUser(
    requestInput: UserActionInput,
  ): Promise<SuccessResponseWithDataPayload> {
    const { userId, action } = requestInput;
    const usersToUpdate: DeepPartial<User>[] = [];
    const notFoundIds: string[] = [];

    const users = await this.usersRepository.find({
      where: { id: In(userId) },
    });

    if (users.length < userId.length) {
      const foundUserIds = users.map((user) => user.id);
      notFoundIds.push(...userId.filter((id) => !foundUserIds.includes(id)));
    }

    const status = action ? UserStatus.DISABLED : UserStatus.ACTIVE;
    const disabledAt = action ? new Date() : null;

    users.forEach((user) => {
      usersToUpdate.push({ id: user.id, status, disabledAt });
    });

    const updatedUsers = await this.usersRepository.save(usersToUpdate);

    if (notFoundIds.length > 0) {
      throw new BadRequestException(
        'There was a problem performing this action on some users',
      );
    }

    return new SuccessResponse(
      `You have successfully ${action ? 'blocked' : 'unblocked'} the selected users`,
      updatedUsers,
    );
  }
}
