import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dtos';
import { User } from 'src/entities';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register
   *
   * @async
   * @param {RegisterInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => User, { name: 'register' })
  async register(
    @Args('RegisterInput') inputDto: RegisterInput,
  ): Promise<User> {
    return await this.authService.register(inputDto);
  }
}
