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
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Listing } from './listing.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Wishlist extends BaseEntity {
  @Field(() => Listing)
  @ManyToOne(() => Listing, (listing) => listing.wishlist)
  listing: Listing;

  @Field(() => User)
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.wishlist)
  user: User;

  @Field()
  @Column()
  userId: string;

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
