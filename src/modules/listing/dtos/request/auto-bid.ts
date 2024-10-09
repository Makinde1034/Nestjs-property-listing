import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
@InputType()
export class CreateAutoBidInput {
  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  auctionId: string;
}
