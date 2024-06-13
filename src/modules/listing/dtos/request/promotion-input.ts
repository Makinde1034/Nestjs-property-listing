import { Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

export class CreatePromotionInput {
  @Field()
  @IsString()
  listingId: string;
  @Field()
  @IsString()
  paymentReference: string;
  @Field()
  @IsString()
  adPackageId: string;
}
