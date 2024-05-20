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
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { NationalIdentityType } from 'src/common/enums';

@InputType()
export class IdentityInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @Field()
  @IsEnum(NationalIdentityType)
  @IsNotEmpty()
  type: NationalIdentityType;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
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
