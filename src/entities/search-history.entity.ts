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
import { IsEnum } from 'class-validator';
import { ListingType } from './listing-type.entity';
import { Purpose } from '../common/enums';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class SearchHistory extends BaseEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  location: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  price: number;

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [Number])
  numberOfBathrooms: number[];

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [Number])
  numberOfRooms: number[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  @IsEnum(Purpose)
  type: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  @IsEnum(ListingType)
  listingType: string;

  @Column({ default: true })
  @Field({ defaultValue: true })
  isValid: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  userId: string;

  @Field(() => [User])
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.searchHistory)
  user: User;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
