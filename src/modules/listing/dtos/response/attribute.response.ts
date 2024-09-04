import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Attribute, AttributeSet } from '../../../../entities';

@ObjectType()
export class AttributeSetResponse {
  @Field(() => [AttributeSet])
  attributeSet: AttributeSet[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class AttributeResponse {
  @Field(() => [Attribute])
  attribute: Attribute[];

  @Field(() => Int)
  total: number;
}
