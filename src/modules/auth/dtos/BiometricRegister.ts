/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class BiometricRegister {
  @Field()
  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;
}

@InputType()
export class BiometricLogin {
  @Field()
  @IsNotEmpty()
  @IsString()
  signature: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  payload: string;
}
