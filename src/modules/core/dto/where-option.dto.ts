/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

@InputType()
export class WhereOption {
  @IsOptional()
  @IsString()
  @Field()
  fieldToChose: string;

  @ValidateIf((o) => o.fieldToChose !== undefined)
  @IsNotEmpty({ message: 'WhereParam must contain a value' })
  @Field(() => String, { nullable: true })
  whereParam: boolean | string | number;
}
