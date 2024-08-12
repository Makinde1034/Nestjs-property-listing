/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { ParentIssue } from './parent-issue.entity';
import { Ticket } from './ticket.entity';

@Entity()
@ObjectType()
export class ChildIssue extends BaseEntity {
  @Field(() => ParentIssue)
  @JoinColumn({ name: 'parentIssueId' })
  @ManyToOne(() => ParentIssue, (parent) => parent)
  parentIssue: ParentIssue;

  @Column({ nullable: true })
  @Field({ nullable: true })
  parentIssueId: string;

  @Field(() => Ticket)
  @OneToMany(() => Ticket, (ticket) => ticket.childIssue)
  ticket: Ticket;

  @Column({ nullable: true })
  @Field({ nullable: true })
  childReason: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  childArabicReason: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  sequentialId: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
