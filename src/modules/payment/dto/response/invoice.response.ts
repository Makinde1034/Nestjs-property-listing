/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Invoice } from '../../../../entities/invoice.entity';

@ObjectType()
export class InvoiceResponse {
  @Field(() => [Invoice])
  invoices: [Invoice];

  @Field()
  total: number;
}
