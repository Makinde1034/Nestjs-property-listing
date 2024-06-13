/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ListingType } from 'src/common/enums';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';

@InputType()
export class AttributeDto extends PaginateAndSort {
  @Field({ nullable: true })
  @IsEnum(ListingType)
  @IsNotEmpty()
  listingType: string;
}
