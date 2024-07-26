import { Field } from '@nestjs/graphql';

export class CreateInvoiceInput {
  @Field()
  price: number;

  @Field()
  userId: string;

  @Field()
  expiredAt: Date;

  @Field()
  listingid: string;
}
