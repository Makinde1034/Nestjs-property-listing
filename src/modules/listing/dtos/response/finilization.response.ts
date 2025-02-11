import { Field, ObjectType } from '@nestjs/graphql';
import { Finalization } from '../../../../entities/finalization.entity';

@ObjectType()
export class FinalizationResponse {
  @Field(() => [Finalization])
  finalization: Finalization[];

  @Field()
  total: number;
}
