/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import {
  ListingType,
  Ownership,
  RentingOption,
  SellingType,
} from '../../../../common/enums';

@InputType()
export class CreateListingDto {
  @Field()
  @IsString()
  @IsEnum(Ownership)
  ownership: string;

  @Field()
  @IsString()
  @IsEnum(SellingType)
  selling_type: string;

  @Field({ nullable: true })
  @ValidateIf((o) => o.ownership == Ownership.NOT_OWNER)
  @IsNotEmpty({
    message: 'power_of_attorney is required for none owners of property',
  })
  @IsString()
  power_of_attorney: string;

  @Field({ defaultValue: 'property' })
  @IsString()
  @IsEnum(ListingType)
  listing_type: string;

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
  district_city: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID()
  country: string;

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

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  amenities: string[];
}
