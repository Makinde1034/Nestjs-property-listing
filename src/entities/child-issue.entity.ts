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
  @ManyToOne(() => ParentIssue, (parent) => parent.childIssue)
  parentIssue: ParentIssue;

  @Column({ nullable: true })
  @Field({ nullable: true })
  parentIssueId: string;

  @Field(() => Ticket)
  @OneToMany(() => Ticket, (ticket) => ticket.childIssue)
  ticket: Ticket;

  @Column({ nullable: true })
  @Field({ nullable: true })
  englishName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  sequentialId: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
