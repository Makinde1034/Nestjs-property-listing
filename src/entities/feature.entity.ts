/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdPackage } from './ad-package.entity';
import { Listing } from './listing.entity';

@Entity()
@ObjectType()
export class Feature {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  listingId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  endDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  startDate: Date;

  @Field(() => AdPackage, { nullable: true })
  @ManyToOne(() => AdPackage, (adPackage) => adPackage.promotion, {})
  @JoinColumn()
  adPackage: AdPackage;

  @Field(() => Listing)
  @ManyToOne(() => Listing, (listing) => listing.feature)
  listing: Listing;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
