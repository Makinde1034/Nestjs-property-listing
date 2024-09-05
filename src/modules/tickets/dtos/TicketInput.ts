/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TicketStatus } from 'src/common/enums';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@InputType()
export class CreateTicketInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  issueId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  childIssueId: string;
}

@InputType()
export class CreateResponseTemplateInput {
  @Field()
  @IsString()
  templateName: string;

  @Field()
  @IsString()
  templateArabicName: string;

  @Field()
  @IsString()
  templateText: string;

  @Field()
  @IsString()
  templateArabicText: string;
}

@InputType()
export class UpdateResponseTemplateInput extends PartialType(
  CreateResponseTemplateInput,
) {
  @Field()
  @IsUUID()
  id: string;
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
export class ListTicketInput extends PaginateAndSort {
  @Field({ nullable: true })
  @IsEnum(TicketStatus)
  @IsOptional()
  status: TicketStatus;
}

@InputType()
export class DeleteResponsetemplate {
  @Field(() => [String])
  @IsArray()
  id: string[];
}
