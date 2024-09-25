import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from '../../../../entities/article.entity';
@ObjectType()
export class ArticleResponse {
  @Field(() => [Article])
  article: [Article];

  @Field()
  total: number;
}
