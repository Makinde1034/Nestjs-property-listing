/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

@InputType()
export class PermissionItem {
  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  permissionId: number;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  approve: boolean;
}

@InputType()
export class RoleInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => [PermissionItem])
  @ValidateNested()
  @Type(() => PermissionItem)
  @IsNotEmpty()
  permissions: PermissionItem[];
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

  @Field(() => [PermissionItem])
  @ValidateNested()
  @Type(() => PermissionItem)
  @IsNotEmpty()
  permissions: PermissionItem[];
}

@ObjectType()
export class PermissionData {
  @Field(() => Number)
  id: number;

  @Field()
  slug: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  functionDescription?: string;

  @Field({ nullable: true })
  remarks?: string;

  @Field({ nullable: true })
  arabicLabel?: string;

  @Field({ defaultValue: false, nullable: true })
  approveFlag?: boolean;

  @Field({ defaultValue: true, nullable: true })
  useFlag?: boolean;

  @Field({ defaultValue: true, nullable: true })
  staffAccess?: boolean;

  @Field({ defaultValue: false, nullable: true })
  individualAccess?: boolean;

  @Field({ defaultValue: false, nullable: true })
  companyAccess?: boolean;
}

@ObjectType()
export class RoleData {
  @Field(() => Number)
  id: number;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => [PermissionData])
  permissions: PermissionData[];
}
