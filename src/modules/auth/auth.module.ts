import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserModule, MailModule],
  providers: [AuthResolver, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
