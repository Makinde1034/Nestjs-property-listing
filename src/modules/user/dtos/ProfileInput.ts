/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
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
export class NotificationItemInput {
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

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  scopeId: number;
}

@InputType()
export class NotificationPrefenceInput {
  @Field(() => [NotificationItemInput])
  @ValidateNested()
  @Type(() => NotificationItemInput)
  @IsNotEmpty()
  @IsArray()
  notificationPreferences: NotificationItemInput[];
}
