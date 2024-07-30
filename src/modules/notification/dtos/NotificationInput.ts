/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationEventInput } from 'src/common/interface';

@InputType()
export class NotificationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isEmail: boolean;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isPushNotification: boolean;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  recipients: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  deepLink: string;
}

export class NotificationEventDto {
  constructor(public input: NotificationEventInput) {}
}
