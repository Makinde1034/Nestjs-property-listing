/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { ParentIssue } from './parent-issue.entity';

@Entity()
@ObjectType()
export class ChildIssue extends BaseEntity {
  @Field(() => ParentIssue)
  @ManyToOne(() => ParentIssue, (parent) => parent)
  parentIssue: ParentIssue;

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
export { ParentIssue };
