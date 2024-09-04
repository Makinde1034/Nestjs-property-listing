import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AttributeSet } from '../../../../entities';

@ObjectType()
export class AttributeSetResponse {
  @Field(() => [AttributeSet])
  attributeSet: AttributeSet[];

  @Field(() => Int)
  total: number;
}
