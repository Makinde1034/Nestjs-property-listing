import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateAuctionInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  startDate: Date;

  @Field()
  @IsString()
  liveFor: number;

  @Field()
  @IsString()
  maxListing: number;
}
