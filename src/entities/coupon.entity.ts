/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Coupon {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  code: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  appliedTo: string;

  @Field()
  @Column()
  maxUse: number;

  @Field()
  @Column()
  usage: string;

  @Field()
  @Column({ default: 0 })
  currentUse: number;

  @Field()
  @Column()
  discountType: string;

  @Field()
  @Column()
  discountValue: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @Column()
  startDate: Date;

  @Field(() => GraphQLISODateTime)
  @Column()
  endDate: Date;

  @Field()
  @Column({ default: 'active' })
  status: string;

  @Field()
  @Column({ default: false })
  deactived: boolean;

  @Field(() => GraphQLISODateTime)
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
