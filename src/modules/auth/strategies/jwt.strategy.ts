import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from 'src/common/interface';
import { AppStrings } from 'src/common/messages/app.strings';
import { User } from 'src/entities';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }
  async validate(payload: JWTPayload): Promise<User> {
    const user = await this.userService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    } else if (!user.verifiedAt) {
      throw new ForbiddenException(AppStrings.UNCONFIRMED_ACCOUNT);
    }
    return user;
  }
}
