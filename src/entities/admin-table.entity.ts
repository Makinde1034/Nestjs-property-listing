/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';
import { Field } from '@nestjs/graphql';

@Entity()
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
  @CreateDateColumn()
  createdAt: Date;
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
