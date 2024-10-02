import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsPositive, IsString } from 'class-validator';
@InputType()
export class CreateBidInput {
  userId: string;

  bidNumber: number;

  @Field()
  @IsNumber()
  @IsPositive()
  price: number;

  @Field()
  @IsString()
  auctionId: string;

  @Field()
  @IsString()
  listingId: string;
}

@InputType()
export class FindBidInput {
  @Field()
  @IsString()
  auctionId: string;

  @Field()
  @IsString()
  listingId: string;
}
