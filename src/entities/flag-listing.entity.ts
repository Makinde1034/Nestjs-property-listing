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
import { Listing } from './listing.entity';
import { User } from './user.entity';
@Entity()
@ObjectType()
export class FlagListing extends BaseEntity {
  @Field()
  @Column({ nullable: true })
  parentIssue: string;

  @Field()
  @Column()
  userId: string;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (reporter) => reporter.flagListing, { eager: true })
  reporter: User;

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
