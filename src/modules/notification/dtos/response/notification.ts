import { Field, ObjectType } from '@nestjs/graphql';
import { Notification } from '../../../../entities';

@ObjectType()
export class NotificationResponse {
  @Field(() => [Notification])
  notification: Notification[];

  @Field()
  unread: number;
  @Field()
  total: number;
}
