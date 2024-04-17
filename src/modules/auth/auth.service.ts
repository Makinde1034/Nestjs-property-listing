import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterEventDto, RegisterInput } from './dtos';
import { User } from 'src/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterEventAction } from 'src/common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Register
   *
   * @async
   * @param {RegisterInput} inputDto
   * @returns {Promise<User>}
   */
  async register(inputDto: RegisterInput): Promise<User> {
    try {
      // check for user with same email or phone
      const existingUser = await this.userService.findUser([
        { email: inputDto.email },
        { phone: inputDto.phone },
      ]);

      // Throw an exception for already used email
      if (existingUser) {
        throw new HttpException('User Already Exist', HttpStatus.CONFLICT);
      }

      // create user
      const data = {
        ...inputDto,
      } as Partial<User>;
      const newUser = await this.userService.createUser(data);
      this.eventEmitter.emit(
        RegisterEventAction.USER_CREATED,
        new RegisterEventDto(newUser),
      );
      return newUser;
    } catch (error) {
      console.log({ error });
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
    console.log('Sending email...', user);
  }
}
