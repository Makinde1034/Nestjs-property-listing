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
import { Exclude } from 'class-transformer';

@Entity()
@ObjectType()
export class Listing extends BaseEntity {
  @Column()
  @Field()
  ownership: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Column()
  @Field()
  sellingType: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  powerOfAttorney: string;

  @Field({ defaultValue: 'property' })
  @Column({ default: 'property' })
  listingType: string;

  @Column()
  @Field()
  rentingOption: string;

  @Column()
  @Field()
  propertyNumber: string;

  @Column()
  @Field()
  @Exclude()
  deedNumber: string;

  @Column()
  @Field()
  districtCity: string;

  @Field()
  @Column({ nullable: true })
  country: string;

  @Column()
  @Field()
  propertySize: string;

  @Column()
  @Field()
  price: string;

  @Column()
  @Field()
  @Exclude()
  publicationDate: string;

  @Column()
  @Field()
  numberOfBathrooms: string;

  @Column()
  @Field()
  numberOfBedrooms: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  mediaType: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  objectName: string[];

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.reviewer)
  user: User;

  @Column()
  @Field()
  userId: string;

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
