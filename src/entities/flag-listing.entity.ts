/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Listing } from './listing.entity';
@Entity()
@ObjectType()
export class FlagListing extends BaseEntity {
  @Field()
  @Column()
  listingId: string;

  @Field()
  @Column({ nullable: true })
  reasonForFlag: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  description: string;

  @ManyToOne(() => Listing, (listing) => listing.flag)
  listing: Listing;

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
