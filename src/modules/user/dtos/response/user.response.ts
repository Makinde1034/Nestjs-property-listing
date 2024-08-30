import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../../../entities';
@ObjectType()
export class UserResponse {
  @Field(() => [User])
  users: User[];

  @Field()
  total: number;
}
