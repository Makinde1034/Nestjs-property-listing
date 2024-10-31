/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  NationalIdentityRepository,
  RoleRepository,
  UserConfirmationRepository,
  UserRepository,
} from '../repositories';
import type {
  Role,
  TokenConfirmation,
  User,
  UserNotificationPreference,
} from '../../../entities';
import {
  Brackets,
  DeepPartial,
  FindOptionsWhere,
  In,
  LessThan,
  Not,
} from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import { addHours, isPast } from 'date-fns';
import {
  CreateStaffInput,
  NotificationPrefenceInput,
  UserProfileInput,
  StaffConfirmDto,
  StaffCreatedData,
  StaffCreatedEventDto,
  UserActionInput,
  PasswordInput,
  ImageResponse,
  UpdateUserData,
  AssignRoleInput,
  DeleteUserInput,
} from '../dtos/request';
import { StorageService } from '../../file-handler/services/storage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NationalIdentityType,
  RegisterEventAction,
  ServerSentEvents,
  UserLevelEnum,
  UserProfileTypeEnum,
  UserStatus,
} from '../../../common/enums';
import { MailgunEmailService } from '../../mail/services/implementations';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  NotificationScopeRepository,
  UserNotificationRepository,
} from '../repositories/notification.repository';
import {
  generateOtp,
  generateRandomToken,
} from '../../../common/utils/functions';
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { UserFilter } from '../dtos/request/user';

import {
  NafathAuthenticationResponseToUser,
  NafathUserResponse,
  NafathWebHookResponse,
  UserUpgradeInput,
} from '../dtos/response/nafath';
import { NafathService } from '../service-providers/nafath.service';
import { NafathLogsRepository } from '../repositories/nafath-log.repository';
import { sleep } from '../../../common/utils/helper';
import { SseService } from '../../app/client.service';
import { MessageEvent } from '../../app/request/app';
import { ActivityEnum } from '../../../common/enums/activitys';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';

@Injectable()
export class UserService {
  private readonly frontEndUrl: string;
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly tokenRepository: UserConfirmationRepository,
    private readonly nationalIdentityRepository: NationalIdentityRepository,
    private readonly storageService: StorageService,
    private readonly roleRepository: RoleRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailgunEmailService,
    private readonly configService: ConfigService,
    private readonly nafathService: NafathService,
    private readonly nafathLogsRepository: NafathLogsRepository,
    private readonly sseService: SseService,
    private readonly activityLogsService: ActivityLogService,
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
    try {
      const salt = await bcrypt.genSalt();
      userData.password = await bcrypt.hash(userData.password, salt);
      userData.employeeId = JSON.stringify(generateOtp());

      const user = await this.usersRepository.save(userData);

      return user;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async verifyUser(
    userUpgradeInput: UserUpgradeInput,
    user: User,
  ): Promise<NafathAuthenticationResponseToUser> {
    try {
      const result = await this.nafathService.verifyUser(userUpgradeInput.id);
      if (!result) {
        throw new BadRequestException('Failed to initiate verification');
      }

      /************************************************
       *Bypass Nafath
       *
       ************************************************/
      //TODO: remove before going live
      if (result.test) {
        await this.usersRepository.update(user.id, {
          userLevel: UserLevelEnum.LEVEL_2,
          isDataVerified: true,
        });

        await this.nafathLogsRepository.save({ ...result, userId: user.id });
        this.performActionWithDelay(user);
        return { random: result.random };
      }

      /*************************************************/
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  /************************************************
   *Bypass Nafath
   *
   ************************************************/
  //TODO: remove before going live

  async performActionWithDelay(user: any) {
    this.logger.log('Action started');

    const payload: MessageEvent = {
      type: ServerSentEvents.SUCCESS,
      data: user,
    };
    // Sleep for 2 seconds (2000 milliseconds)
    await sleep(30000);
    this.sseService.sendEvent(user.id, payload);
    this.logger.log('Action resumed after 30 seconds');
  }

  /************************************************
   *Bypass Nafath
   *
   ************************************************/
  //TODO: remove before going live

  // triggerNotification(userId: string, payload: MessageEvent) {
  //   const client = this.clientsService.getClient(userId);
  //   console.log(client);
  //   if (client) {
  //     client.next(payload); // Send the notification/event
  //   } else {
  //     console.warn(`No client connected for userId: ${userId}`);
  //   }
  // }
  async finalizeUpgradeUser(
    data?: NafathWebHookResponse,
    userData?: NafathUserResponse,
  ) {
    try {
      const nafathLog = await this.nafathLogsRepository.findOne({
        where: {
          transId: data.transId,
        },
      });
      if (nafathLog) {
        const { affected } = await this.usersRepository.update(
          nafathLog.userId,
          {
            userLevel: UserLevelEnum.LEVEL_2,
            firstName: userData.user_info['first_name#en'],
            lastName: userData.user_info['family_name#en'],
            arabicFirstName: userData.user_info['first_name#ar'],
            arabicLastName: userData.user_info['family_name#ar'],
            middleName: userData.user_info['grand_name#en'],
            arabicMiddleName: userData.user_info['grand_name#ar'],
            dateOfBirth: new Date(userData.user_info['dob#g']),
            nationality: userData.user_info['nationality#en'],
            isDataVerified: true,
          },
        );
        if (affected > 0) {
          const user = await this.usersRepository.findOneBy({
            id: nafathLog.userId,
          });
          //TODO switch to event emiter

          // this.eventController.triggerEventForUser(user.id, {});
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
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
   * @async
   * @param {string} id
   * @returns {Promise<User>}
   */
  async findUserById(id: string, relations?: string[]): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        relations,
      });
      return user;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
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
    //TODO: Add check to ensure only user and admin can update user

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
    const salt = await bcrypt.genSalt();
    const passwordToUpdate = await bcrypt.hash(newPassword, salt);

    const { affected } = await this.usersRepository.update(user.id, {
      password: passwordToUpdate,
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
    try {
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
      return await this.usersRepository.save({
        id: user.id,
        notificationPreference: preferencesData,
      });
    } catch (error) {
      throw new BadRequestException(error);
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

  /****************
   * ADMIN
   ****************/

  async updateTerm(user: User): Promise<SuccessResponse> {
    await this.usersRepository.update(user.id, {
      currentTermOfservice: user.termsOfServiceVersion,
    });

    return new SuccessResponse(AppStrings.SUCCESSFULL);
  }

  async forceUpdate(version: string): Promise<SuccessResponse> {
    await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ currentTermOfservice: version })
      .execute();

    return new SuccessResponse(AppStrings.SUCCESSFULL);
  }

  async assignRoleToUser(assignRoleInput: AssignRoleInput) {
    try {
      // Find the roles based on the provided role IDs
      const roles = await this.roleRepository.find({
        where: { id: In(assignRoleInput.roleId) }, // Use `In` to find all roles matching the IDs
      });

      // Find the user by the provided user ID
      const user = await this.usersRepository.findOne({
        where: { id: assignRoleInput.userId },
        relations: ['roles'], // Include the current roles to manage them properly
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Assign the new roles to the user
      user.roles = roles;

      // Save the updated user entity with new roles
      await this.usersRepository.save(user);

      // Return the updated user with roles
      return await this.usersRepository.findOneOrFail({
        where: { id: assignRoleInput.userId },
        relations: ['roles'], // Ensure to load the roles relation when returning the user
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAllUser(userFilterInput: UserFilter) {
    try {
      const {
        level,
        status,
        type,
        roles,
        sortField,
        directionToSort,
        take,
        isBlocked,
        skip,
      } = userFilterInput;

      // Validate sort direction
      const validSortDirections = ['ASC', 'DESC'];
      const direction = directionToSort?.toUpperCase();
      if (direction && !validSortDirections.includes(direction)) {
        throw new Error(`Invalid sort direction: ${direction}`);
      }

      // Build where options
      const whereOptions: any = {
        ...(level && { userLevel: level }),
        ...(status && { status: In(status) }),
        ...(roles && { roles: { id: In(roles) } }),
        ...(type && { type: In(type) }),
        isBlocked: isBlocked ?? undefined,
      };

      // Build order options
      const orderOptions = sortField ? { [sortField]: direction || 'ASC' } : {};

      // Set default pagination values if not provided
      const paginationTake = take ?? 20;
      const paginationSkip = skip ?? 0;

      // Fetch employees with count
      const [users, count] = await this.usersRepository.findAndCount({
        order: orderOptions,
        where: whereOptions,
        take: paginationTake,
        skip: paginationSkip,
      });

      return { users, total: count };
    } catch (error) {
      this.logger.error('Failed to get customer', error);
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  async findAllCustomers(userFilterInput: UserFilter) {
    try {
      const {
        level,
        status,
        sortField,
        directionToSort,
        isBlocked,
        take,
        skip,
      } = userFilterInput;

      // Validate sort direction
      const validSortDirections = ['ASC', 'DESC'];
      const direction = directionToSort?.toUpperCase();
      if (direction && !validSortDirections.includes(direction)) {
        throw new Error(`Invalid sort direction: ${direction}`);
      }

      // Build where options
      const whereOptions: any = {
        ...(level ? { userLevel: In(level) } : {}),
        ...(status ? { status: In(status) } : {}),
        isBlocked: isBlocked ?? undefined,
        userType: Not(UserProfileTypeEnum.STAFF),
      };

      // Build order options
      const orderOptions = sortField ? { [sortField]: direction || 'ASC' } : {};

      // Set default pagination values if not provided
      const paginationTake = take ?? 20;
      const paginationSkip = skip ?? 0;

      // Fetch employees with count
      const [users, count] = await this.usersRepository.findAndCount({
        order: orderOptions,
        where: whereOptions,
        take: paginationTake,
        skip: paginationSkip,
      });

      return { users, total: count };
    } catch (error) {
      this.logger.error('Failed to get customer', error);
      throw new BadRequestException('Failed to retrieve customer');
    }
  }

  async searchForUsers(searchParam: string) {
    try {
      return await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .where('user.userType != :type', { type: UserProfileTypeEnum.STAFF }) // Ensure proper exclusion of userType STAFF
        // Combine all other conditions using OR logic
        .andWhere(
          new Brackets((qb) => {
            qb.where('user.firstName LIKE :term', {
              term: `%${searchParam}%`,
            })
              .orWhere('user.lastName LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('user.userType LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('user.userLevel LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('user.email LIKE :term', { term: `%${searchParam}%` })
              .orWhere('user.status LIKE :term', { term: `%${searchParam}%` })
              .orWhere('user.employeeId LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('role.arabicName LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('role.englishName LIKE :term', {
                term: `%${searchParam}%`,
              });
          }),
        )
        .take(10) // Limit to 10 results
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async searchForEmployee(searchParam: string) {
    try {
      return await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .where('user.userType = :type', { type: UserProfileTypeEnum.STAFF }) // Ensure proper exclusion of userType STAFF
        // Combine all other conditions using OR logic
        .andWhere(
          new Brackets((qb) => {
            qb.where('user.firstName LIKE :term', {
              term: `%${searchParam}%`,
            })
              .orWhere('user.lastName LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('user.userType LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('user.userLevel LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('user.email LIKE :term', { term: `%${searchParam}%` })
              .orWhere('user.status LIKE :term', { term: `%${searchParam}%` })
              .orWhere('user.employeeId LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('role.arabicName LIKE :term', {
                term: `%${searchParam}%`,
              })
              .orWhere('role.englishName LIKE :term', {
                term: `%${searchParam}%`,
              });
          }),
        )
        .take(10) // Limit to 10 results
        .getMany();
    } catch (error) {
      this.logger.log(error);
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
      this.sendPasswordEmailToStaff(updatedUser);
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

  /********************
   * STAFF
   * SPECIFIC
   * METHODS
   ********************/

  /**
   * Create Staff User
   *
   * @async
   * @param {CreateStaffInput} input
   * @returns {Promise<Staff>}
   */
  async createStaff(input: CreateStaffInput, admin: User): Promise<User> {
    try {
      const roles = await this.roleRepository.find({
        where: { id: In([...input.roles]) },
      });
      const password = generateRandomToken(8);
      const staffData: Partial<User> = {
        ...input,
        roles,
        password,
        employeeId: `${generateOtp()}`,
        userType: 'staff',
        twoFaRequired: true,
      };
      const staff = await this.createUser(staffData);
      this.eventEmitter.emit(
        RegisterEventAction.STAFF_CREATED,
        new StaffCreatedEventDto({ staff }),
      );

      await this.activityLogsService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          details: JSON.stringify(staff),
          userId: staff.id,
        },
      ]);
      return staff;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateUserData(input: UpdateUserData, admin: User): Promise<User> {
    try {
      let roles: Role[];
      if (input.roles?.length) {
        roles = await this.roleRepository.find({
          where: { id: In([...input.roles]) },
        });
      }

      const { id, ...rest } = input;

      const userData = {
        ...rest,
        roles,
      };
      const user = await this.usersRepository.save({ id, ...userData });

      await this.activityLogsService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.UPDATED,
          details: JSON.stringify(userData),
          userId: user.id,
        },
      ]);

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async getEmployees(userFilterInput: UserFilter) {
    try {
      const {
        level,
        status,
        type,
        roles,
        sortField,
        isBlocked,
        directionToSort,
        take,
        skip,
      } = userFilterInput;

      // Validate sort direction
      const validSortDirections = ['ASC', 'DESC'];
      const direction = directionToSort?.toUpperCase();
      if (direction && !validSortDirections.includes(direction)) {
        throw new Error(`Invalid sort direction: ${direction}`);
      }

      // Build where options
      const whereOptions: any = {
        ...(level ? { userLevel: In(level) } : {}),
        ...(status ? { status: In(status) } : {}),
        ...(type ? { type: In(type) } : {}),
        ...(roles ? { roles: { id: In(roles) } } : {}),
        ...(isBlocked !== undefined ? { isBlocked } : {}),
        userType: UserProfileTypeEnum.STAFF,
      };
      // Build order options
      const orderOptions = sortField ? { [sortField]: direction || 'ASC' } : {};

      // Set default pagination values if not provided
      const paginationTake = take ?? 20;
      const paginationSkip = skip ?? 0;

      // Fetch employees with count
      const [users, count] = await this.usersRepository.findAndCount({
        order: orderOptions,
        where: { ...whereOptions },
        take: paginationTake,
        skip: paginationSkip,
      });

      return { users: users, total: count };
    } catch (error) {
      this.logger.log(error);
      this.logger.error('Failed to get employees', error);
      throw new BadRequestException(error);
    }
  }

  /**
   * Send password reset email to staff
   * @async
   * @param {StaffCreatedData} data
   * @returns {Promise<void>}
   */
  async sendPasswordEmailToStaff(data: StaffCreatedData): Promise<void> {
    const { staff } = data;
    const { token } = await this.generateUserConfirmation(staff);

    const link = `${this.frontEndUrl}/staff-confirmation?email=${staff.email}&token=${token}`;

    await this.mailService.sendStaffConfirmation(staff, link);
  }

  /**
   * Confirm registered staff
   * Validate new password
   *
   * @async
   * @param {StaffConfirmDto} requestInput
   * @returns {string}
   */
  async staffPasswordConfirmation(
    requestInput: StaffConfirmDto,
  ): Promise<string> {
    const { email, token, password } = requestInput;
    const userConfirmation = await this.findTokenConfirmation(email, token);

    if (userConfirmation) {
      const { user } = userConfirmation;
      // If user already complete account setup
      // FE: need to redirect to /login
      if (user.verifiedAt) {
        throw new BadRequestException(AppStrings.ACCOUNT_ALREADY_CONFIRMED);
      }

      if (this.validateUserConfirmation(userConfirmation, token)) {
        await this.usersRepository.update(user.id, {
          verifiedAt: new Date(),
          status: UserStatus.VERIFIED,
          password,
        });
        await this.removeUserConfirmation(userConfirmation.id);
        return AppStrings.ACCOUNT_CONFIRMED_SUCCESSFULLY;
      }
    }
    throw new BadRequestException(AppStrings.WRONG_CONFIRM_CODE);
  }

  /**
   * Confirm registered staff
   * Validate new password
   *
   * @async
   * @param {UserActionInput} requestInput
   * @returns {Promise<User>}
   */
  async blockUser(
    requestInput: UserActionInput,
    admin: User,
  ): Promise<SuccessResponse> {
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

    const disabledAt = action ? new Date() : null;

    users.forEach((user) => {
      usersToUpdate.push({ id: user.id, isBlocked: action, disabledAt });
    });

    const updatedUsers = await this.usersRepository.save(usersToUpdate);

    if (notFoundIds.length > 0) {
      throw new BadRequestException(
        'There was a problem performing this action on some users',
      );
    }

    const activityToSave = users.map((element) => {
      return {
        adminId: admin.id,
        action: ActivityEnum.BLOCKED,
        details: JSON.stringify(element),
        userId: element.id,
      };
    });

    await this.activityLogsService.logActivity(activityToSave);

    return new SuccessResponse(
      `You have successfully ${action ? 'blocked' : 'unblocked'} the selected users`,
      updatedUsers,
    );
  }

  async deleteUser(
    requestInput: DeleteUserInput,
    admin: User,
  ): Promise<SuccessResponse> {
    const { userId } = requestInput;
    const usersToUpdate: DeepPartial<User>[] = [];
    const notFoundIds: string[] = [];

    const users = await this.usersRepository.find({
      where: { id: In(userId) },
    });

    if (users.length < userId.length) {
      const foundUserIds = users.map((user) => user.id);
      notFoundIds.push(...userId.filter((id) => !foundUserIds.includes(id)));
    }

    const status = UserStatus.DELETED;
    const deletedAt = new Date();

    users.forEach((user) => {
      usersToUpdate.push({ id: user.id, status, deletedAt });
    });

    const updatedUsers = await this.usersRepository.save(usersToUpdate);

    // If (notFoundIds.length > 0) {
    //   Throw new BadRequestException(
    //     'There was a problem performing this action on some users',
    //   );
    // }

    const activityToSave = users.map((element) => {
      return {
        adminId: admin.id,
        action: ActivityEnum.DELETED,
        details: JSON.stringify(element),
        userId: element.id,
      };
    });

    await this.activityLogsService.logActivity(activityToSave);
    return new SuccessResponse(
      `You have successfully deleted the selected users`,
      updatedUsers,
    );
  }

  async enableAutoBid(user: User) {
    try {
      return await this.usersRepository.update(user.id, {
        autoBidEnable: true,
      });
    } catch (error) {
      this.logger.log(error);
    }
  }
}
