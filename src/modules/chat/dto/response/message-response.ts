/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Messages } from '../../../../entities/message.entity';
@ObjectType()
export class MessageResponse {
  @Field(() => [Messages])
  messages: Messages[];

  @Field()
  total: number;

  @Field({ nullable: true })
  lastMessage: Messages;
}
