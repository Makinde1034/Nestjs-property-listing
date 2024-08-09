/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ChildIssue } from './child-issue.entity';
import BaseEntity from './base.entity';

@Entity()
@ObjectType()
export class ParentIssue extends BaseEntity {
  @Field(() => [ChildIssue])
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
