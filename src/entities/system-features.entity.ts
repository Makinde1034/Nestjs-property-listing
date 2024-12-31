/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class SystemFeatureSetting extends BaseEntity {
  @Field()
  @Column()
  englishName: string;

  @Field()
  @Column()
  arabicName: string;

  @Field()
  @Column()
  slug: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column()
  description: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @DeleteDateColumn()
  deleteAt: Date;
}
