import { Field, ObjectType } from '@nestjs/graphql';
import { Auction } from '../../../../entities/auction-table.entity';
import { Listing } from '../../../../entities';

@ObjectType()
export class AuctionDetailsResponse {
  @Field(() => Auction)
  auction: Auction;

  @Field(() => [AuctionDetail])
  auctionDetails: AuctionDetail[];

  @Field()
  total: number;
}

@ObjectType()
export class AuctionDetail {
  @Field(() => Listing, { nullable: true })
  listing: Listing;
  @Field(() => [String], { nullable: true })
  bidders: string[];
  @Field({ nullable: true })
  winner: string;
  @Field({ nullable: true })
  totalBids: number;
  @Field({ nullable: true })
  status: string;
}
