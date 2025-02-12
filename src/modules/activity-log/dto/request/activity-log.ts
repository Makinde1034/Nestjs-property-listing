/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';

@InputType()
export class ActivityLogInput extends PaginateAndSort {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  @IsOptional()
  fieldToFilter: string;
}

@InputType()
export class AuditLogTrailsInput extends PaginateAndSort {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userName: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  minDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  maxDate: Date;
}
