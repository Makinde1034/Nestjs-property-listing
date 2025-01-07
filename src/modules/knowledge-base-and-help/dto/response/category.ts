/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from '../../../../entities/knowledge-base-category.entity';
@ObjectType()
export class CategoryResponse {
  @Field(() => [Category])
  category: Category[];

  @Field()
  count: number;
}
