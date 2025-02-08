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
export class AuctionBidRange extends BaseEntity {
  @Field()
  @Column()
  lowerBound: number;

  @Field()
  @Column()
  upperBound: number;

  @Field()
  @Column()
  increment: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  heldAmount: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(GraphQLISODateTime)
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
