/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from '../../../../entities/article.entity';
@ObjectType()
export class ArticleResponse {
  @Field(() => [Article])
  article: [Article];

  @Field()
  total: number;
}
