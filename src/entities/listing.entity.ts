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
import { ListingType } from './listing-type.entity';
import { IsArray, IsEnum, IsIn } from 'class-validator';

@Entity()
@ObjectType()
export class Listing extends BaseEntity {
  @Column()
  @Field()
  ownership: string;

  @Column()
  @Field()
  selling_type: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  power_of_attorney: string;

  @Field({ defaultValue: 'property' })
  @Column({ default: 'property' })
  listing_type: string;

  @Column()
  @Field()
  renting_option: string;

  @Column()
  @Field()
  property_number: string;

  @Column()
  @Field()
  deed_number: string;

  @Column()
  @Field()
  district_city: string;

  @Field()
  @Column({ nullable: true })
  country: string;

  @Column()
  @Field()
  property_size: string;

  @Column()
  @Field()
  publication_date: string;

  @Column()
  @Field()
  number_of_rooms: string;

  @Column()
  @Field()
  number_of_bathrooms: string;

  @Column()
  @Field()
  number_of_bedrooms: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  media_type: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  object_name: string;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.reviewer)
  user: User;

  @Column()
  @Field()
  user_id: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  amenities: string[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
