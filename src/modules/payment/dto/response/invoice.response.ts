import { Field, ObjectType } from '@nestjs/graphql';
import { Invoice } from '../../../../entities/invoice.entity';

@ObjectType()
export class InvoiceResponse {
  @Field(() => [Invoice])
  invoices: [Invoice];

  @Field()
  total: number;
}
