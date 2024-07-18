/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Listing } from './listing.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class ListingAttributes extends BaseEntity {
  @Field(() => Listing)
  @JoinColumn({ name: 'listingId' })
  @ManyToOne(() => Listing, (listing) => listing.listingAttributes)
  listing: Listing;

  @Column()
  listingId: string;

  @Column()
  attributeId: string;
}
