import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterEventDto, RegisterInput } from './dtos';
import { User } from 'src/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterEventAction } from 'src/common/enums';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AppInfo } from 'src/common/utils/AppInfo';
import { AuthRegisterConfirmDto } from './dtos/RegisterConfirm';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  private readonly frontEndUrl: string;
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.frontEndUrl = this.configService.get('FRONT_END_URL');
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

    const link = `${this.frontEndUrl}/email_verification/${email}/${token}`;
    const emailMessage = {
      to: email,
      from: AppInfo.NO_REPLY_EMAIL_ADDRESS, // Use the email address or domain you verified above,
      templateId: AppInfo.EMAIL_VERIFICATION_TEMPLATE,
      dynamicTemplateData: {
        action_link: link,
        app_name: AppInfo.APP_NAME,
      },
    };

    await this.mailService.sendEmail(emailMessage);
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
        await this.userService.setAsConfirmed(user.id);
        return this.i18n.translate(
          'messages.register.ACCOUNT_CONFIRMED_SUCCESSFULLY',
        ) as string;
      }
    }
    throw new BadRequestException(
      this.i18n.t('messages.register.WRONG_CONFIRM_CODE'),
    );
  }
}
