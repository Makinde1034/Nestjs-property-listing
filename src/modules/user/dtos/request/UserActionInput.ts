/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UserActionInput {
  @Field(() => [String])
  @IsNotEmpty()
  @IsArray()
  userId: string[];

  @Field()
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  action: boolean;
}
