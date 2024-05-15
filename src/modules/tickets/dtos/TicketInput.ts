/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from 'src/common/enums';

@InputType()
export class CreateTicketInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  issueId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  issuCategoryId: string;
}

@InputType()
export class UpdateTicketInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @Field()
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}

@InputType()
export class ListTicketInput {
  @Field({ nullable: true })
  @IsEnum(TicketStatus)
  @IsOptional()
  status: TicketStatus;
}
