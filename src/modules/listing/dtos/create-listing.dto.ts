/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RentingOption, SellingType } from '../../../common/enums/listing.enum';

@InputType()
export class CreateListingDto {
  @Field()
  @IsString()
  @IsEnum(SellingType)
  selling_type: string;

  @Field()
  @IsString()
  @IsEnum(RentingOption)
  renting_option: string;

  @Field()
  @IsString()
  property_number: string;

  @Field()
  @IsString()
  deed_number: string;

  @Field()
  @IsString()
  @IsUUID()
  district_city: string;

  @Field()
  @IsString()
  property_size: string;

  @Field()
  @IsString()
  publication_date: string;

  @Field()
  @IsString()
  number_of_rooms: string;

  @Field()
  @IsString()
  number_of_bathrooms: string;

  @Field()
  @IsString()
  number_of_bedrooms: string;

  user_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  media_type: string;

  @Field({ nullable: true })
  @IsOptional()
  object_name: string;
}
