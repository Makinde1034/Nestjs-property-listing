/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { IsEnum, IsOptional } from 'class-validator';
import {
  UserLevelEnum,
  UserProfileTypeEnum,
  UserStatus,
} from '../../../../common/enums';
@InputType()
export class UserFilter extends PaginateAndSort {
  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(UserLevelEnum)
  level: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(UserProfileTypeEnum)
  type: string;
}
