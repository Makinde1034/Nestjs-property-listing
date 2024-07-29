/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { AttributeSet } from './attribute-set.entity';
import { Listing } from './listing.entity';

@Entity()
@ObjectType()
export class ListingType extends BaseEntity {
  @Column()
  @Field()
  englishName: string;

  @Column()
  @Field()
  arabicName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  icon: string;

  @Field(() => Listing)
  @OneToMany(() => Listing, (listing) => listing.listingType)
  listing: Listing;

  @Field(() => [AttributeSet])
  @ManyToMany(() => AttributeSet, (attribute) => attribute.listingTypes, {
    cascade: true,
    eager: true,
  })
  @JoinTable({ name: 'listing_types_attribute_sets' })
  attributeSets: AttributeSet[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
