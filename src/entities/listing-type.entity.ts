/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { AttributeSet } from './attribute-set.entity';
import { Listing } from './listing.entity';
import { ActivityLog } from './activity-log.entity';
import { Invoice } from './invoice.entity';

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

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;
  @Field(() => Invoice, { nullable: true })
  @OneToMany(() => Invoice, (invoice) => invoice.listingType)
  invoice: Invoice;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
