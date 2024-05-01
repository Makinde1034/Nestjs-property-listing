/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { IssuePlacement } from 'src/common/enums';
import { Issue } from './issue.entity';

@Entity()
@ObjectType()
export class IssueCategory extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  placement: IssuePlacement;

  @OneToMany(() => Issue, (issue) => issue.category, { eager: true })
  issues: Issue[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
