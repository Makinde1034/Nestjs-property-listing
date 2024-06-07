/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LocationDto {
  @Field()
  @IsString()
  lng: string;

  @Field()
  @IsString()
  lat: string;
}
