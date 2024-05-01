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
import { IssueCategory } from './issue-category.entity';

@Entity()
@ObjectType()
export class Issue extends BaseEntity {
  @Column()
  @Field()
  message: string;

  @ManyToOne(() => IssueCategory, (category) => category.issues, {
    cascade: true,
  })
  category: IssueCategory;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
