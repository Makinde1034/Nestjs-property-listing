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
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { ParentIssue } from './parent-issue.entity';

@Entity()
@ObjectType()
export class IssueCategory extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Field(() => [ParentIssue], { nullable: true })
  @OneToMany(() => ParentIssue, (parentIssue) => parentIssue.issueCategory, {})
  parentIssues: ParentIssue[];

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
