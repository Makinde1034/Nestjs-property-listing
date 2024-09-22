/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

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
