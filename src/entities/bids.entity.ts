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
export class Bids {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  userId: string;

  @Column()
  @Field()
  bidNumber: number;

  @Column('decimal', { precision: 12, scale: 2 })
  @Field()
  price: number;

  @Column()
  @Field()
  auctionId: string;

  @Column()
  @Field()
  listingId: string;

  @Column({ default: false })
  @Field()
  autoBid: boolean;

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
