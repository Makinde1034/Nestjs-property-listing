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
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ListingType } from './listing-type.entity';
import { Purpose } from '../common/enums';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class SearchHistory extends BaseEntity {
  @Column()
  @Field()
  location: string;

  @Column()
  @Field()
  price: string;

  @Column()
  @Field()
  numberOfBathrooms: string;

  @Column()
  @Field()
  numberOfRooms: string;

  @Column()
  @Field()
  @IsEnum(Purpose)
  type: string;

  @Field()
  @IsString()
  @IsEnum(ListingType)
  listingType: string;

  @Column({ default: true })
  @Field({ defaultValue: true })
  isValid: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @Field()
  userId: string;

  @Field(() => [User])
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.searchHistory)
  user: User;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
