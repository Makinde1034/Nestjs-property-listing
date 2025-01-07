/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class AcceptedTerms extends BaseEntity {
  @Field()
  @Column()
  version: string;

  // @Field(() => User)
  // @JoinColumn({ name: 'userId' })
  // @ManyToOne(() => User, (user) => user.term, {
  //   Cascade: true,
  //   Eager: true,
  // })
  // User: User;

  @Field()
  @Column()
  userId: string;

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
