import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from '../../../../entities/knowledge-base-category.entity';
@ObjectType()
export class CategoryResponse {
  @Field(() => [Category])
  category: Category[];

  @Field()
  count: number;
}
