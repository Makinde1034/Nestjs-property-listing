/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ChildIssue } from './child-issue.entity';
import BaseEntity from './base.entity';
import { IssueCategory, Ticket } from '.';

@Entity()
@ObjectType()
export class ParentIssue extends BaseEntity {
  @Field(() => IssueCategory, { nullable: true })
  @JoinColumn({ name: 'issueCategoryId' })
  @ManyToOne(() => IssueCategory, (issueCategory) => issueCategory, {
    eager: true,
  })
  issueCategory: IssueCategory;

  @Column()
  @Field()
  issueCategoryId: string;

  @Field(() => [Ticket], { nullable: true })
  @OneToMany(() => Ticket, (childIssue) => childIssue)
  ticket: Ticket[];

  @Field(() => [ChildIssue], { nullable: true })
  @OneToMany(() => ChildIssue, (childIssue) => childIssue)
  childIssue: ChildIssue[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  parentReason: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  sequentialId: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  parentArabicReason: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
