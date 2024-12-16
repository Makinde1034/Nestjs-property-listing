/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

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
  @IsOptional()
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
    minUppercase: 1,
  })
  password: string;
}
@InputType()
export class UpdateUserData extends PartialType(CreateStaffInput) {
  @Field()
  @IsString()
  id: string;
}
