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
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import { IssueCategory } from './issue-category.entity';
import { Issue } from './issue.entity';
import { TicketStatus } from 'src/common/enums';
import { Exclude } from 'class-transformer';

@ObjectType()
@Entity()
export class Ticket extends BaseEntity {
  @Field(() => User)
  @ManyToOne(() => User, { cascade: true, eager: true })
  reporter: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { cascade: true, eager: true })
  support: User;

  @Field(() => IssueCategory)
  @ManyToOne(() => IssueCategory, { cascade: true, eager: true })
  issueCategory: IssueCategory;

  @Field(() => Issue)
  @ManyToOne(() => Issue, { cascade: true, eager: true })
  issue: Issue;

  @Field()
  @Column({ default: TicketStatus.OPEN })
  status: TicketStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  type: string;

  @Field()
  @Column()
  openedAt: Date;

  @Field()
  @Column({ default: true })
  isOpen: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  closedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  assignedAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @Field({ nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;
}
