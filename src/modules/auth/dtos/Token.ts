/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenType {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
