/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class AuthRegisterConfirmDto {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  token: string;
}
