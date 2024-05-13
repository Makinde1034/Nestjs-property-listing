/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class IdentityInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  type: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  identityNumber: string;

  @Field()
  @IsNotEmpty()
  @IsDate()
  dateOfExpiry: Date;
}

@InputType()
export class NotificationPrefenceInput {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  email: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  sms: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  pushNotification: boolean;
}
