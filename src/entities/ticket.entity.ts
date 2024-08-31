/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import { TicketStatus } from '../common/enums';
import { Exclude } from 'class-transformer';
import { Chat } from './chat.entity';
import { ParentIssue } from './parent-issue.entity';
import { ChildIssue } from './child-issue.entity';

@ObjectType()
@Entity()
export class Ticket extends BaseEntity {
  @Field(() => User)
  @ManyToOne(() => User, { cascade: true, eager: true })
  reporter: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { cascade: true, eager: true })
  support: User;

  @Field(() => ParentIssue, { nullable: true })
  @ManyToOne(() => ParentIssue, (parentIssue) => parentIssue.ticket, {
    cascade: true,
    eager: true,
  })
  parentIssue: ParentIssue;

  @Field(() => ChildIssue, { nullable: true })
  @ManyToOne(() => ChildIssue, (childIssue) => childIssue.ticket, {
    cascade: true,
    eager: true,
  })
  childIssue: ChildIssue;

  @Field()
  @Column({ default: TicketStatus.OPEN })
  @Index()
  status: TicketStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  type: string;

  @Field(() => Chat, { nullable: true })
  @OneToOne(() => Chat, (chat) => chat.ticket, { eager: true })
  chat: Chat;

  @Field()
  @Column()
  openedAt: Date;

  @Field()
  @Column({ default: true })
  isOpen: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  closedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  assignedAt: Date;

  @Field()
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @Field({ nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;
}
