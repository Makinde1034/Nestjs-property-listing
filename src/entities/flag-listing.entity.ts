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
  @Column({ nullable: true })
  parentIssue: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  childIssue: string;

  @Field(() => Listing, { nullable: true })
  @ManyToOne(() => Listing, (listing) => listing.flag, { eager: true })
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
