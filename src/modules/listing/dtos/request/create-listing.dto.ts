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
  Purpose,
  RentingOption,
} from '../../../../common/enums';

@InputType()
export class CreateListingDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  @IsEnum(Ownership)
  ownership: string;

  @Field()
  @IsString()
  @IsEnum(Purpose)
  sellingType: string;

  @Field({ nullable: true })
  @ValidateIf((o) => o.ownership == Ownership.NOT_OWNER)
  @IsNotEmpty({
    message: 'power0fAttorney is required for none owners of property',
  })
  @IsString()
  powerOfAttorney: string;

  @Field({ defaultValue: 'property' })
  @IsString()
  @IsEnum(ListingType)
  listingType: string;

  @Field()
  @IsString()
  @IsEnum(RentingOption)
  rentingOption: string;

  @Field()
  @IsString()
  propertyNumber: string;

  @Field()
  @IsString()
  deedNumber: string;

  @Field()
  @IsString()
  districtCity: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID()
  country: string;

  @Field()
  @IsString()
  propertySize: string;

  @Field()
  @IsString()
  publicationDate: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  price: string;

  @Field()
  @IsString()
  numberOfBathrooms: string;

  @Field()
  @IsString()
  numberOfBedrooms: string;

  userId?: string;

  @Field({ defaultValue: 'image', nullable: true })
  @IsOptional()
  mediaType: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  objectName: string[];

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  amenities: string[];
}
