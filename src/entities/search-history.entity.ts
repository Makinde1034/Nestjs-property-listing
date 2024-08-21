/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

import { User } from './user.entity';

@Entity()
@ObjectType()
export class SearchHistory extends BaseEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  userId: string;

  @Field(() => [User])
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.searchHistory)
  user: User;

  @Column({ nullable: true })
  @Field({ nullable: true })
  minPrice: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  purpose: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  maxPrice: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  minArea: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  maxArea: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  gpsCoordinate: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  attributes: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  type: string;

  @Column({ default: false })
  @Field({ defaultValue: false })
  isValid: boolean;

  @Field({ nullable: true })
  rentingOption: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  listingId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
