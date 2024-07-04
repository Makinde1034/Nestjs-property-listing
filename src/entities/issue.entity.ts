/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
@ObjectType()
export class Issue extends BaseEntity {
  @Column({ nullable: true })
  @Field()
  message: string;

  @Column({ nullable: true })
  @Field()
  category: string;

  @Column({ nullable: true })
  @Field()
  parentReason: string;

  @Column({ nullable: true })
  @Field()
  parentArabicName: string;

  @Column({ nullable: true })
  @Field()
  childReason: string;

  @Column({ nullable: true })
  @Field()
  childArabicName: string;

  // @ManyToOne(() => IssueCategory, (category) => category.issues, {
  //   Cascade: true,
  // })
  // Category: IssueCategory;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
