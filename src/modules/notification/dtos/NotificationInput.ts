/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationEventInput } from 'src/common/interface';
import { NotificationItemInput } from '../../user/dtos/request';

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
  deepLink?: string;
}

export class NotificationEventDto {
  constructor(public input: NotificationEventInput) {}
}

@InputType()
export class CreateNotificationScopePreferenceInput {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  email: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  desktop: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  mobile: boolean;
}

@InputType()
export class CreateNotificationScopeInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  scopeGroup: string;
}

@InputType()
export class UpdateAdminNotificationScope extends PartialType(
  CreateNotificationScopeInput,
) {
  @Field()
  @IsNumber()
  id: number;
}

@InputType()
export class UpdateAdminNotificationPreferenceScope extends PartialType(
  CreateNotificationScopePreferenceInput,
) {
  @Field()
  @IsNumber()
  id: string;
}
