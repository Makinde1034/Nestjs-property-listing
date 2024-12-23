/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class LocationDto {
  @IsString()
  @Field()
  @IsOptional()
  placeId: string;

  @Field()
  @IsNumber()
  @IsOptional()
  lng: number;

  @Field()
  @IsNumber()
  @IsOptional()
  lat: number;
}
