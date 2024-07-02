/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateAdPackageInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  price: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  impression: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  coverageRadius: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  duration: string;
}
