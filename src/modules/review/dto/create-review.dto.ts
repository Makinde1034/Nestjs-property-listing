/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ServicesOffered } from '../../../common/enums';
@InputType()
export class CreateReviewDto {
  @Field()
  @IsNumber()
  rating: number;

  @IsOptional()
  @Field({ nullable: true })
  comment?: string;

  @Field()
  @IsEnum(ServicesOffered)
  type: string;

  @Field()
  @IsOptional()
  service_owner_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  reviewer_id?: string;
}
