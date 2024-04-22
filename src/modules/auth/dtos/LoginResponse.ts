import { Field, ObjectType } from '@nestjs/graphql';
import { TokenType } from './Token';
import { User } from 'src/entities';

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user: User;

  @Field(() => TokenType)
  token: TokenType;
}
