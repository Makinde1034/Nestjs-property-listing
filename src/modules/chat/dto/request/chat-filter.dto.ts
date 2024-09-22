/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { IsNotEmpty, IsString } from 'class-validator';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { Field, InputType } from '@nestjs/graphql';
@InputType()
export class ChatFilterInput extends PaginateAndSort {
  @IsString()
  @IsNotEmpty()
  @Field()
  ticketId: string;
}
