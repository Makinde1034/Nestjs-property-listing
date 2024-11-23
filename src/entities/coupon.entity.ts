/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
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
  type: string;

  @Field()
  @Column()
  usage: string;

  @Field()
  @Column()
  currentUse: number;

  @Field()
  @Column()
  discountType: string;

  @Field()
  @Column()
  discountValue: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  startDate: Date;

  @Field()
  @Column()
  endDate: Date;

  @Field()
  @Column({ default: false })
  deactived: boolean;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
