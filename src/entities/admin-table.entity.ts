/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class AdminDefault extends BaseEntity {
  @Field()
  @Column()
  minimumOfferPercentage: number;

  @Field()
  @Column()
  street: string;

  @Field()
  @Column()
  city: string;

  @Field()
  @Column({ type: 'decimal' })
  saii: number;

  @Field()
  @Column({ type: 'decimal' })
  vat: number;

  @Field()
  @Column()
  state: string;
  @Field()
  @Column()
  country: string;
  @Field()
  @Column()
  countryISOCode: string;
  @Field()
  @Column()
  postcode: string;

  @Field()
  @Column()
  daysToAuctionRegistrationEnd: number;

  @Field()
  @Column()
  daysToAuctionRegistrationStart: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
