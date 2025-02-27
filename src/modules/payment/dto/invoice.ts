/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field } from '@nestjs/graphql';

export class CreateInvoiceInput {
  @Field()
  capturedPrice?: number;

  @Field()
  qrcode?: string;

  @Field()
  userId: string;

  @Field()
  vat?: number;

  @Field()
  expiredAt: Date;

  @Field()
  type?: string;

  @Field()
  listingid: string;

  @Field()
  offerId: string;
}
