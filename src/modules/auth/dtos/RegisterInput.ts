/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UserProfileTypeEnum } from 'src/common/enums';
import { UserProfileType } from 'src/common/types';
import { CompanyInput } from './CompanyInput';
import { Type } from 'class-transformer';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty()
  @IsEnum(UserProfileTypeEnum)
  userType: UserProfileType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  recaptcha: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null, { message: 'This field must be a valid phone number' })
  phone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @Field(() => CompanyInput, { nullable: true })
  @ValidateNested()
  @Type(() => CompanyInput)
  @ValidateIf((o) => o.userType === UserProfileTypeEnum.COMPANY)
  company: CompanyInput;
}

@InputType()
export class ConfirmationInput {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
