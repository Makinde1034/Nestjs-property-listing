/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field } from '@nestjs/graphql';

export class CreateInvoiceInput {
  @Field()
  price?: number;
  @Field()
  qrcode?: string;

  @Field()
  userId: string;

  @Field()
  expiredAt: Date;

  @Field()
  listingid: string;
}
