/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
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
  @IsEnum(Purpose)
  purpose: string;

  @Field()
  @IsString()
  @IsEnum(Ownership)
  ownership: string;

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

  @Field({ nullable: true })
  @IsOptional()
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

  @Field({ defaultValue: 'rent' })
  @IsString()
  sellingType: string;

  @ValidateIf((listing) => listing.listingType == ListingType.APPARTMENT)
  @Field()
  @IsString()
  numberOfRooms: string;

  userId?: string;

  @Field({ defaultValue: 'image' })
  @IsOptional()
  mediaType: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  image: string[];

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
  @IsString()
  city: string;

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
  rentedAppartment: string;

  @Field({ nullable: true })
  @IsOptional()
  negotiable: boolean;

  @Field({ nullable: true })
  pool: boolean;

  @Field({ nullable: true })
  outdoorKitchen: boolean;

  @Field({ nullable: true })
  garden: boolean;

  @Field({ nullable: true })
  guestHouse: boolean;

  @Field({ nullable: true })
  tennisCourt: boolean;

  @Field({ nullable: true })
  basketballCourt: boolean;

  @Field({ nullable: true })
  jacuzzi: boolean;

  @Field({ nullable: true })
  bbqArea: boolean;

  @Field({ nullable: true })
  maidsRoom: boolean;

  @Field({ nullable: true })
  petsAllowed: boolean;

  @Field({ nullable: true })
  balcony: boolean;

  @Field({ nullable: true })
  gym: boolean;

  @Field({ nullable: true })
  playground: boolean;

  @Field({ nullable: true })
  parking: boolean;

  @Field({ nullable: true })
  security: boolean;

  @Field({ nullable: true })
  airConditioning: boolean;

  @Field({ nullable: true })
  storageRoom: boolean;

  @Field({ nullable: true })
  laundryRoom: boolean;

  @Field({ nullable: true })
  conferenceRoom: boolean;

  @Field({ nullable: true })
  gatedCommunity: boolean;

  @Field({ nullable: true })
  indoorPlayArea: boolean;

  @Field({ nullable: true })
  coveredParking: boolean;

  @Field({ nullable: true })
  wifi: boolean;

  @Field({ nullable: true })
  elevator: boolean;
}

@InputType()
export class UpdateListingDto extends PartialType(CreateListingDto) {
  @Field()
  @IsUUID()
  id: string;
}
