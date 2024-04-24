/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

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
