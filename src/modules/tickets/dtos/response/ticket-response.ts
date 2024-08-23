/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Ticket } from '../../../../entities';

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
  @Field(() => [Ticket])
  ticket: Ticket[];

  @Field()
  analysis: TicketAnalysisResponse;
}
