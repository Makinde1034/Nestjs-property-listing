/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, MaritalStatus } from 'src/common/enums';

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
  @IsString()
  @IsDate()
  dateOfExpiry: Date;
}

@InputType()
export class ProfileInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field()
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @Field()
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @Field()
  @IsOptional()
  @IsString()
  occupation: string;

  @Field()
  @IsOptional()
  @IsString()
  language: string;

  @Field()
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(null, { message: 'This field must be a valid phone number' })
  phone: string;

  @Field(() => IdentityInput, { nullable: true })
  @ValidateNested()
  @Type(() => IdentityInput)
  @IsOptional()
  nationalIdentity: IdentityInput;
}
