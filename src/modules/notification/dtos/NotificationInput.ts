/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
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
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  description: string;

  @Field({ nullable: true })
  @IsString()
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

@InputType()
export class CreateNotificationMessage {
  @Field()
  @IsString()
  scope: string;

  @Field()
  @IsString()
  event: string;

  @Field()
  @IsString()
  directToWeb: string;

  @Field()
  @IsString()
  directToMobile: string;

  @Field()
  @IsString()
  period: string;

  @Field()
  @IsBoolean()
  email: boolean;

  @Field()
  @IsBoolean()
  pushNotification: boolean;

  @Field()
  @IsBoolean()
  systemNotification: boolean;

  @Field({ nullable: true })
  @IsString()
  timing: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  emailTemplate: string;

  @Field()
  @IsString()
  recipients: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  body: string;

  @Field()
  @IsString()
  arabicTitle: string;

  @Field()
  @IsString()
  arabicBody: string;
}

@InputType()
export class UpdateNotificationMessage extends PartialType(
  CreateNotificationMessage,
) {
  @Field()
  @IsString()
  id: string;
}

@InputType()
export class NotificationMessageScope {
  @Field()
  @IsNumber()
  id: string;

  @Field()
  @IsBoolean()
  email: boolean;

  @Field()
  @IsBoolean()
  pushNotification: boolean;

  @Field()
  @IsBoolean()
  systemNotification: boolean;
}
@InputType()
export class UpdateNotificationMessageScope {
  @Field(() => [NotificationMessageScope])
  @IsArray()
  notificationMessageScope: NotificationMessageScope[];
}
