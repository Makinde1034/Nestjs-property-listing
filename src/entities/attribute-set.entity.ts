/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Attribute } from './attribute.entity';
import { ListingType } from './listing-type.entity';

@Entity()
@ObjectType()
export class AttributeSet extends BaseEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  englishName: string;

  @Field(() => [Attribute], { nullable: true })
  @ManyToMany(() => Attribute, (attribute) => attribute.attributeSets, {
    cascade: true,
    eager: true,
  })
  @JoinTable({ name: 'attributes_attribute_set' })
  attributes: Attribute[];

  @Field(() => [ListingType])
  @ManyToMany(() => ListingType, (listing) => listing.attributeSets)
  listingTypes: ListingType[];
  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
