/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { WorkflowActionStatus } from '../common/enums/status.enum';

@Entity()
@ObjectType()
export class ActionRequest {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column()
  actionType: string; // "create" or "update"

  @Column()
  targetEntity: string; // E.g., "User", "Order", "Product"

  @Column({ nullable: true })
  targetEntityId?: string; // E.g., User ID, Order ID (null for "create" actions)

  @Column()
  @Field(() => String)
  payload: string;

  @Column({ default: WorkflowActionStatus.PENDING })
  @Field()
  status: string;

  @ManyToOne(() => User, (user) => user.requests)
  @Field(() => User)
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User)
  admin: User;

  @Column({ nullable: true })
  @Field({ nullable: true })
  event: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
