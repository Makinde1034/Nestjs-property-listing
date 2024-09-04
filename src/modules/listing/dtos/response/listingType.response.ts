import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ListingType } from '../../../../entities';

@ObjectType()
export class ListingTypesResponse {
  @Field(() => [ListingType])
  ListingType: ListingType[];

  @Field(() => Int)
  total: number;
}
