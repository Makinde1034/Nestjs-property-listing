/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import BaseEntity from './base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Listing } from './listing.entity';
@Entity()
@ObjectType()
export class Place extends BaseEntity {
  @Field()
  @Column()
  placeId: string;

  @Field()
  @Column()
  type: string;

  @Field(() => Listing)
  @ManyToOne(() => Listing, (listing) => listing.place)
  listing: Listing;
}
