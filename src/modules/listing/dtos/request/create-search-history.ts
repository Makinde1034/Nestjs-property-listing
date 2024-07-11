/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
@InputType()
export class CreateSearchHistoryInput extends PaginateAndSort {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  location: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  price: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  numberOfBathrooms: string;
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  numberOfRooms: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  type: string;

  @IsOptional()
  @Field({ nullable: true })
  @IsString()
  listingType: string;
}
