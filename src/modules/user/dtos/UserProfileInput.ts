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
import { IdentityInput } from './ProfileInput';

@InputType()
export class UserProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  occupation: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null, { message: 'This field must be a valid phone number' })
  phone: string;

  @Field(() => IdentityInput, { nullable: true })
  @ValidateNested()
  @Type(() => IdentityInput)
  @IsOptional()
  nationalIdentity: IdentityInput;
}
