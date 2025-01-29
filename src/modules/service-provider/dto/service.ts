/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InputType, Field, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ServiceProviderStatus } from '../../../common/enums/status.enum';

@InputType()
export class Pricing {
  @Field()
  @IsString()
  @IsNotEmpty()
  type: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  price: number;
}

@InputType()
export class CreateServiceProviderInput {
  @Field({ nullable: true })
  @IsString()
  iban: string;

  @Field()
  @IsString()
  serviceOffered: string;

  @Field()
  @IsString()
  coverageArea: string;
}

@InputType()
export class UpdateServiceProviderInput extends PartialType(
  CreateServiceProviderInput,
) {
  @Field()
  @IsString()
  id: string;
}

@InputType()
export class CreateServiceInput {
  @Field()
  @IsString()
  englishServiceName: string;

  @Field()
  @IsString()
  arabicServiceName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  active: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  isWorkLicenseRequired: boolean;

  @Field(() => [Pricing])
  @IsArray()
  pricing: Pricing;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(ServiceProviderStatus)
  providerServiceStatus: string;
}
@InputType()
export class UpdateServiceInput extends PartialType(CreateServiceInput) {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  reason: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
@InputType()
export class DeleteServiceProvider {
  @Field(() => [String])
  @IsArray()
  id: string[];
}

@InputType()
export class ApprovalInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  reason: string;
}

@InputType()
export class ServiceProviderInput {
  @Field(() => [ApprovalInput])
  @IsArray()
  approvalInput: ApprovalInput[];
}

@InputType()
export class ProvideNewService {
  @Field()
  @IsString()
  serviceProviderId: string;

  @Field()
  @IsString()
  serviceId: string;
}
@InputType()
export class ProvideServiceStatusInput {
  @Field(() => [String])
  @IsArray()
  id: string[];
}

@InputType()
export class RequestForService {
  @Field()
  @IsString()
  serviceProvidedId: string;

  @Field()
  @IsString()
  listingId: string;
}
