/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class LocationDto {
  @Field()
  @IsNumber()
  lng: number;

  @Field()
  @IsNumber()
  lat: number;
}
