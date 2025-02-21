/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
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
import { ActivityLog } from './activity-log.entity';

@ObjectType()
@Entity()
export class Ticket extends BaseEntity {
  @Field(() => User, { nullable: true })
  @Index()
  @ManyToOne(() => User, { cascade: true })
  reporter: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { cascade: true })
  support: User;

  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.ticket)
  ticketActivityLog: ActivityLog;

  @Field(() => ParentIssue, { nullable: true })
  @Index()
  @ManyToOne(() => ParentIssue, (parentIssue) => parentIssue.ticket, {
    cascade: true,
    eager: true,
  })
  parentIssue: ParentIssue;

  @Field(() => ChildIssue, { nullable: true })
  @Index()
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
  @OneToOne(() => Chat, (chat) => chat.ticket)
  chat: Chat;

  @Field(() => GraphQLISODateTime)
  @Column()
  openedAt: Date;

  @Field()
  @Column({ default: true })
  isOpen: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  @Index()
  closedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ticketNumber: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  @Index()
  assignedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn({ default: new Date() })
  updatedAt: Date;

  @Exclude()
  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;
}
