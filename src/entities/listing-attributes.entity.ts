/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Listing } from './listing.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Attribute } from './attribute.entity';

@Entity()
@ObjectType()
export class ListingAttributes extends BaseEntity {
  @Field(() => Listing)
  @ManyToOne(() => Listing, (listing) => listing.listingAttributes)
  listing: Listing;

  @Field(() => Attribute, { nullable: true })
  @JoinColumn({ name: 'attributeId' })
  @Index()
  @ManyToOne(() => Attribute, (attribute) => attribute.listingAttribute, {
    eager: true,
  })
  attribute: Attribute;

  @Column()
  @Field({ nullable: true })
  name: string;

  @Column()
  @Field({ nullable: true })
  attributeId: string;

  @Column()
  @Field({ nullable: true })
  value: string;
}
