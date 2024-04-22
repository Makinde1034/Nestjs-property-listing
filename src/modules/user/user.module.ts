import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenConfirmation, User } from '../../entities';
import { UserConfirmationRepository, UserRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, TokenConfirmation])],
  providers: [UserService, UserRepository, UserConfirmationRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
