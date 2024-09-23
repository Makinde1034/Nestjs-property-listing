/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ListingType } from 'src/common/enums';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';

@InputType()
export class AttributeDto extends PaginateAndSort {
  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(ListingType)
  @IsNotEmpty()
  listingType: string;
}

@InputType()
export class AttributeFilter extends PaginateAndSort {
  @Field({ nullable: true })
  @IsOptional()
  englishName: string;
  @Field({ nullable: true })
  @IsOptional()
  type: string;
  @Field({ nullable: true })
  @IsOptional()
  showInFilters: boolean;
  @Field({ nullable: true })
  @IsOptional()
  showInComparison: boolean;
  @Field({ nullable: true })
  @IsOptional()
  showInSummary: boolean;
  @Field({ nullable: true })
  @IsOptional()
  isRequired: boolean;
  @Field({ nullable: true })
  @IsOptional()
  hiddenToBuyers: boolean;
  @Field({ nullable: true })
  @IsOptional()
  isAmenity: boolean;
  @Field({ nullable: true })
  @IsOptional()
  isAddress: boolean;
}
