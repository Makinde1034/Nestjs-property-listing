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
  @Field({ nullable: true })
  message: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  category: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  parentReason: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  parentArabicReason: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  childReason: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  childArabicReason: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
