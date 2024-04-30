/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  UserConfirmationRepository,
  UserRepository,
  StaffRepository,
  RoleRepository,
} from '../repositories';
import type { Staff, TokenConfirmation, User } from 'src/entities';
import { DeepPartial, FindOptionsWhere, In, LessThan } from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import { addHours, isPast } from 'date-fns';
import { generateOtp, generateRandomToken } from 'src/common/utils/functions';
import {
  CreateStaffInput,
  ImageResponse,
  ProfileInput,
  StaffConfirmDto,
  StaffCreatedData,
  StaffCreatedEventDto,
} from '../dtos';
import { StorageService } from '../../storage/storage.service';
import { AppStrings } from 'src/common/messages/app.strings';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterEventAction, UserStatus } from 'src/common/enums';
import { MailService } from 'src/modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly frontEndUrl: string;
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly tokenRepository: UserConfirmationRepository,
    private readonly storageService: StorageService,
    private readonly staffRepository: StaffRepository,
    private readonly roleRepository: RoleRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.frontEndUrl = this.configService.get('FRONT_END_URL');
  }

  /**
   * Create User
   *
   * @async
   * @param {Partial<User>} userData
   * @returns {Promise<User>}
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.create(userData);
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
  async findUserById(id: string): Promise<User> {
    return await this.usersRepository.findById(id);
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
    return await this.usersRepository.update(id, data);
  }

  /**
   * Update User Profile
   *
   * @async
   * @param {User} user
   * @param {ProfileInput} data
   * @returns {Promise<User>}
   */
  async updateProfile(user: User, data: ProfileInput): Promise<User> {
    const updateData = {
      ...data,
    } as Partial<User>;
    const update = await this.usersRepository.update(user.id, updateData);
    return update;
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

  /**
   * Create Staff User
   *
   * @async
   * @param {CreateStaffInput} input
   * @returns {Promise<Staff>}
   */
  async createStaff(input: CreateStaffInput): Promise<Staff> {
    const roles = await this.roleRepository.find({
      where: { id: In([...input.roles]) },
    });
    const password = generateRandomToken(8);
    const staffData: Partial<Staff> = {
      ...input,
      roles,
      password,
      employeeId: `${generateOtp()}`,
      userType: 'staff',
    };
    const staff = await this.staffRepository.create(staffData);
    this.eventEmitter.emit(
      RegisterEventAction.STAFF_CREATED,
      new StaffCreatedEventDto({ staff, password }),
    );
    return staff;
  }

  /**
   * Send password reset email to staff
   * @async
   * @param {StaffCreatedData} data
   * @returns {Promise<void>}
   */
  async sendPasswordEmailToStaff(data: StaffCreatedData): Promise<void> {
    const { staff, password } = data;
    const { token } = await this.generateUserConfirmation(staff);

    const link = `${this.frontEndUrl}/staff-confirmation?email=${staff.email}&token=${token}`;

    await this.mailService.sendStaffConfirmation(staff, link, password);
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
    const { email, token, oldPassword, password } = requestInput;
    const userConfirmation = await this.findTokenConfirmation(email, token);

    if (userConfirmation) {
      const { user } = userConfirmation;
      // If user already complete account setup
      // FE: need to redirect to /login
      if (user.verifiedAt) {
        throw new BadRequestException(AppStrings.ACCOUNT_ALREADY_CONFIRMED);
      }

      if (this.validateUserConfirmation(userConfirmation, token)) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          throw new BadRequestException(AppStrings.INCORRECT_PASSWORD);
        }
        await this.staffRepository.update(user.id, {
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
}
