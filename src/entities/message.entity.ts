/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Chat } from './chat.entity';
import { User } from './user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
@Entity()
@ObjectType()
export class Messages extends BaseEntity {
  @ManyToOne(() => Chat, (chat) => chat.message)
  @Field(() => Chat)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages)
  @Field(() => User)
  user: User;

  @Column()
  @Field()
  message: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  attachment: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
