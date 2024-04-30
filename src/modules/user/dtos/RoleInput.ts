/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class RoleInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => [Number])
  @IsArray()
  @IsNotEmpty()
  permissions: number[];
}

@InputType()
export class RoleIdInputDto {
  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

@InputType()
export class RoleUpdateInputDto extends RoleIdInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => [Number])
  @IsArray()
  @IsNotEmpty()
  permissions: number[];
}
