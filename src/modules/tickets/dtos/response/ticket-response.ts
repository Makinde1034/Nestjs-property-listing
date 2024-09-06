/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Ticket } from '../../../../entities';
import { ResponseTemplate } from '../../../../entities/response-template.entity';

@ObjectType()
export class TicketAnalysisResponse {
  @Field()
  open: number;
  @Field()
  closed: number;
  @Field()
  aging: number;
}
@ObjectType()
export class TicketResponse {
  @Field(() => [Ticket], { nullable: true })
  ticket: Ticket[];

  @Field()
  total: number;

  @Field()
  analysis: TicketAnalysisResponse;
}

@ObjectType()
export class ResponseTemplateResponse {
  @Field(() => [ResponseTemplate], { nullable: true })
  responseTemplate: ResponseTemplate[];

  @Field()
  total: number;
}
