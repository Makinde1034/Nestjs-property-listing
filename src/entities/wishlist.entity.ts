/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field } from '@nestjs/graphql';
import BaseEntity from './base.entity';
import { JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Listing } from './listing.entity';
import { User } from './user.entity';

export class Wishlist extends BaseEntity {
  // @Field(() => [Listing])
  // @OneToMany(() => Listing, (listing) => listing.wishlist, {})
  // Listing: Listing[];
  // @Field(() => User)
  // @JoinColumn({ name: 'userId' })
  // @OneToOne(() => User, (user) => user.wishlist)
  // User: User;
}
