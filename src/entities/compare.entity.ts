/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import BaseEntity from './base.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Compare extends BaseEntity {
  @Field(() => User)
  @JoinColumn({ name: 'userId' })
  @OneToOne(() => User, (user) => user.compare)
  user: User;

  @Field()
  @Column()
  userId: string;

  @Field(() => [String])
  @Column({ type: 'simple-array' })
  listings: string[];

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
