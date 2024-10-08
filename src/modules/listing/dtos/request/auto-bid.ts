import { Field, InputType } from '@nestjs/graphql';
@InputType()
export class CreateAutoBidInput {
  @Field()
  listingId: string;

  @Field()
  auctionId: string;
}
