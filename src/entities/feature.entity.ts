/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field } from '@nestjs/graphql';
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

  @Field({ nullable: true })
  @Column({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  startDate: Date;

  @Field(() => AdPackage)
  @ManyToOne(() => AdPackage, (adPackage) => adPackage.promotion, {})
  @JoinColumn()
  adPackage: AdPackage;

  @Field(() => Listing)
  @ManyToOne(() => Listing, (listing) => listing.feature)
  listing: Listing;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
