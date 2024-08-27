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
export class ResponseTemplate extends BaseEntity {
  @Column()
  @Field()
  templateName: string;

  @Column()
  @Field()
  templateArabicName: string;

  @Column()
  @Field()
  templateText: string;
  @Column()
  @Field()
  templateArabicText: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @DeleteDateColumn()
  @Field()
  deletedAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
