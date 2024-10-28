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
  JoinTable,
  ManyToMany,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { AttributeSet } from './attribute-set.entity';
import { Listing } from './listing.entity';
import { ActivityLog } from './activity-log.entity';

@Entity()
@ObjectType()
export class ListingType extends BaseEntity {
  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.role)
  listingTypeActivityLogs: ActivityLog;

  @Column()
  @Field({ nullable: true })
  englishName: string;

  @Column()
  @Field({ nullable: true })
  arabicName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  icon: string;

  @Field(() => Listing)
  @OneToMany(() => Listing, (listing) => listing.listingType)
  listing: Listing;

  @Field(() => [AttributeSet], { nullable: true })
  @ManyToMany(() => AttributeSet, (attribute) => attribute.listingTypes, {
    cascade: true,
  })
  @JoinTable({ name: 'listing_types_attribute_sets' })
  attributeSets: AttributeSet[];

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
