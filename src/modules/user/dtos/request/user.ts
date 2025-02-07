/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserInterfaceType } from '../../../../common/enums';
import { TimePeriod } from '../../../../common/enums/sort.enum';

@InputType()
export class UserFilter extends PaginateAndSort {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  level: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  status: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isBlocked: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  saudiUser: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  type: string[];

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  @IsArray()
  roles: number[];

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  value: number;
}
@InputType()
export class SwitchInterfaceInput {
  @Field()
  @IsString()
  @IsEnum(UserInterfaceType)
  interface: string;
}
