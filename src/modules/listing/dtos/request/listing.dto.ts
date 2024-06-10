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
  ValidateNested,
} from 'class-validator';

import {
  ListingType,
  Ownership,
  Purpose,
  RentingOption,
} from '../../../../common/enums';
import { LocationDto } from '../../../location/dto/request/location.dto';

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

  @ValidateIf((listing) => listing.listingType == ListingType.APPARTMENT)
  @IsNotEmpty({
    message: 'PropertySize is required for listing type appartment',
  })
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

  @ValidateIf((listing) => listing.listingType == ListingType.APPARTMENT)
  @Field()
  @IsString()
  numberOfBathrooms: string;

  @ValidateIf((listing) => listing.listingType == ListingType.APPARTMENT)
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

  @ValidateNested()
  @IsOptional()
  @Field(() => LocationDto, { nullable: true })
  gpsCoordinate: LocationDto;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  district: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  street: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  building: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  floor: string;

  @ValidateIf((listing) => listing.listingType == ListingType.LAND)
  @Field({ nullable: true })
  @IsNotEmpty({ message: 'LandArea must be provided for Listing type land' })
  @IsString()
  landArea: string;

  @ValidateIf((listing) => listing.ListingType == ListingType.BUILDING)
  @IsNotEmpty({ message: 'This is a required field for listing type building' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfAppartment: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'This is a required field for listing tyoe bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfStoreys: string;

  @ValidateIf((listing) => listing.listingType == ListingType.BUILDING)
  @IsNotEmpty({
    message:
      'This is a required field for listing for listing tyoe villa and building',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  areaPerApartment: string;

  @ValidateIf((listing) => listing.listingType == ListingType.BUILDING)
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  garageArea: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'This is a required field for listing tyoe bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  totalArea: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'This is a required field for listing tyoe bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfRentedAppartment: string;
}

@InputType()
export class UpdateListingDto {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  propertyNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  districtCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  price: string;

  @Field({ nullable: true })
  @IsOptional()
  numberOfBathrooms: string;

  @Field({ nullable: true })
  @IsOptional()
  numberOfBedrooms: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  objectName: string[];

  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @Field(() => [String], { nullable: true })
  amenities: string[];

  @ValidateIf((listing) => listing.listingType == ListingType.APPARTMENT)
  @IsNotEmpty({
    message: 'PropertySize is required for listing type appartment',
  })
  @Field()
  @IsString()
  propertySize: string;

  @Field()
  @IsString()
  publicationDate: string;

  userId?: string;

  @Field({ defaultValue: 'image', nullable: true })
  @IsOptional()
  mediaType: string;

  @ValidateNested()
  @IsOptional()
  @Field(() => LocationDto, { nullable: true })
  gpsCoordinate: LocationDto;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  district: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  street: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  building: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  floor: string;

  @ValidateIf((listing) => listing.listingType == ListingType.LAND)
  @Field({ nullable: true })
  @IsNotEmpty({ message: 'LandArea must be provided for Listing type land' })
  @IsString()
  landArea: string;

  @ValidateIf((listing) => listing.ListingType == ListingType.BUILDING)
  @IsNotEmpty({ message: 'This is a required field for listing type building' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfAppartment: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'This is a required field for listing tyoe bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfStoreys: string;

  @ValidateIf((listing) => listing.listingType == ListingType.BUILDING)
  @IsNotEmpty({
    message:
      'This is a required field for listing for listing tyoe villa and building',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  areaPerApartment: string;

  @ValidateIf((listing) => listing.listingType == ListingType.BUILDING)
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  garageArea: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'This is a required field for listing tyoe bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  totalArea: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'This is a required field for listing tyoe bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfRentedAppartment: string;
}
