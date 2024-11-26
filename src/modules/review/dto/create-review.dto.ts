/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ServicesOffered } from '../../../common/enums';

import { IsRange } from '../../../common/decorator/is-range-of';
@InputType()
export class CreateReviewDto {
  @Field()
  @IsNumber()
  @IsRange(1, 5)
  rating: number;

  @IsOptional()
  @Field({ nullable: true })
  comment?: string;

  @Field()
  @IsEnum(ServicesOffered)
  reviewType: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  providerId: string;

  userId?: string;
}
