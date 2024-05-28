/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CityEntitity } from '../../../entities';
@ObjectType()
export class CityResponse {
  @Field(() => [CityEntitity])
  city: CityEntitity[];

  @Field(() => Int)
  total: number;
}
