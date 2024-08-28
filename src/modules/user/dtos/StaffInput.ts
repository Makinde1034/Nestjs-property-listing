/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { UserLevelEnum } from '../../../common/enums/user.enum';
import { UserProfileTypeEnum } from '../../../common/enums';
import { UserStats } from '../../admin/dto/admin-response';

@InputType()
export class CreateStaffInput {
  @Field({ nullable: true })
  @IsOptional()
  middleName: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => !o.arabicFirstName)
  firstName: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => !o.firstName)
  arabicFirstName: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => !o.arabicLastName)
  lastName: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => !o.lastName)
  arabicLastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  arabicMiddleName: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(null, { message: 'This field must be a valid phone number' })
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @Field(() => [Number])
  @IsArray()
  @IsNotEmpty()
  roles: number[];
}

@InputType()
export class StaffConfirmDto {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  token: string;

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
}

@InputType()
export class StaffFilterInput extends PaginateAndSort {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsEnum(UserLevelEnum)
  level: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(UserStats)
  status: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsEnum(UserProfileTypeEnum)
  type: string;
}
