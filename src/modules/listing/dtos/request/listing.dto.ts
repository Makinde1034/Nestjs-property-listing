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
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { TimePeriod } from '../../../../common/enums/sort.enum';

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
  // Image: string;

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
  @IsNotEmpty({
    message: 'numberOfApartment is a required field for listing type building',
  })
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
    message:
      'numberOfStoreys is a required field for listing type bulding and villa',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  numberOfStoreys: string;

  @ValidateIf((listing) => listing.listingType == ListingType.BUILDING)
  @IsNotEmpty({
    message:
      'areaPerApartment is a required field for listing for listing type villa and building',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  areaPerApartment: string;

  @ValidateIf((listing) => listing.listingType == ListingType.BUILDING)
  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  garageArea: boolean;

  @Field({ nullable: true })
  @IsOptional()
  garageSize: string;

  @ValidateIf(
    (listing) =>
      listing.listingType == ListingType.BUILDING ||
      listing.listingType == ListingType.VILLA,
  )
  @IsNotEmpty({
    message: 'totalArea is a required field for listing type bulding and villa',
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
    message:
      'rentedApartment is a required field for listing type bulding and villa',
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
export class UpdateListingAdminDto {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  district: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  street: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  price: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  numberOfBathrooms: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  totalArea: string;

  @IsOptional()
  @Field({ nullable: true })
  @IsString()
  numberOfRooms: string;

  @IsOptional()
  @Field({ nullable: true })
  @IsBoolean()
  pool: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  outdoorKitchen: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  garden: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  guestHouse: boolean;

  @IsOptional()
  @Field({ nullable: true })
  @IsBoolean()
  tennisCourt: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  basketballCourt: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  jacuzzi: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  bbqArea: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  maidsRoom: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  petAllowed: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  balcony: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  gym: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  playground: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  parking: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  security: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  airConditioning: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  storageRoom: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  laundryRoom: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  conferenceRoom: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  gatedCommunity: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  indoorPlayArea: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  coveredParking: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  wifi: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  elevator: boolean;
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
@InputType()
export class AdminFilterAndSort extends PaginateAndSort {
  @Field({ defaultValue: false })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  promoted: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  sold: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  flagged: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  rented: boolean;
}
