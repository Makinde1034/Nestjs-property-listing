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
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class WorkFlow extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  document: string;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  @Column()
  action: string;

  @Column()
  @Field()
  numberOfApproval: number;

  @Column({ type: 'simple-array' })
  @Field(() => [String])
  approvalOneRole: string[];

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  approvalTwoRole: string[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;
  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
