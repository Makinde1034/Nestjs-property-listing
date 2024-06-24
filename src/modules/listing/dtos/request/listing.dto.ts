/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  ListingFlagType,
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

  @Field({ nullable: true })
  @ValidateIf((Listing) => Listing.purpose == 'rent')
  @IsNotEmpty({
    message:
      'rentingOption must contain monthly, quarterly, bi-quarterly or yearly',
  })
  @IsOptional()
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

  @ValidateIf((listing) => listing.listingType == ListingType.APARTMENT)
  @IsNotEmpty({
    message: 'PropertySize is required for listing type apartment',
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

  @ValidateIf((listing) => listing.listingType == ListingType.APARTMENT)
  @Field()
  @IsString()
  numberOfBathrooms: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  panoramaView: string[];

  @Field({ defaultValue: 'rent' })
  @IsString()
  sellingType: string;

  @ValidateIf((listing) => listing.listingType == ListingType.APARTMENT)
  @Field()
  @IsString()
  numberOfRooms: string;

  userId?: string;

  @Field({ defaultValue: 'image' })
  @IsOptional()
  mediaType: string;

  // @Field(() => String, { nullable: true })
  // @IsOptional()
  // image: string;

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
  numberOfApartment: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'This is a required field for listing type bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfStoreys: string;

  @ValidateIf((listing) => listing.listingType == ListingType.BUILDING)
  @IsNotEmpty({
    message:
      'This is a required field for listing for listing type villa and building',
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
    message: 'This is a required field for listing type bulding and villa',
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
    message: 'This is a required field for listing type bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rentedApartment: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  negotiable: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  pool: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  outdoorKitchen: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  garden: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  guestHouse: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  tennisCourt: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  basketballCourt: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  jacuzzi: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  bbqArea: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  maidsRoom: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  petsAllowed: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  balcony: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  gym: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  playground: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  parking: boolean;
  @Field({ defaultValue: false })
  @IsBoolean()
  security: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  airConditioning: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  storageRoom: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  laundryRoom: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  conferenceRoom: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  gatedCommunity: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  indoorPlayArea: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  coveredParking: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  wifi: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  elevator: boolean;
}

@InputType()
export class UpdateListingDto extends PartialType(CreateListingDto) {
  @Field()
  @IsUUID()
  id: string;
}

@InputType()
export class FlagListingInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @Field()
  @IsEnum(ListingFlagType)
  parentIssue: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  childIssue: string;
}
