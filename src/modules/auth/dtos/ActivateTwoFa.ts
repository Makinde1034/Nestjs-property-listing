/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/entities';

@ObjectType()
export class TwoFaResult {
  @Field(() => User)
  user: User;

  @Field(() => String)
  qrcodeImage: string;
}

@InputType()
export class TwoFaLoginInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  token: string;
}
