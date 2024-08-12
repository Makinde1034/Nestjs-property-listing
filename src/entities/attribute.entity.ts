/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { AttributeSet } from './attribute-set.entity';
import { ListingAttributes } from './listing-attributes.entity';

@Entity()
@ObjectType()
export class Attribute extends BaseEntity {
  @Column()
  @Field({ nullable: true })
  englishName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  type: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  icon: string;

  @Column({ nullable: true, type: 'jsonb' })
  @Field(() => [String], { nullable: true })
  dropDownOptions: string[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  isRequired: boolean;

  @Column()
  @Field()
  showInSummary: boolean;

  @Column()
  @Field()
  hiddenToBuyers: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  isAmenity: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  isAddress: boolean;

  @Column()
  @Field()
  showInComparison: boolean;

  @Column()
  @Field()
  showInFilters: boolean;

  @Column({ nullable: true, default: 0 })
  @Field({ defaultValue: 0 })
  filterIndex: number;

  @Column({ nullable: true, default: 0 })
  @Field({ defaultValue: 0 })
  summaryIndex: number;

  @Column({ nullable: true, default: 0 })
  @Field({ defaultValue: 0 })
  createListingIndex: number;

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  thiqaIntegration: string[];

  @Field(() => [AttributeSet])
  @ManyToMany(() => AttributeSet, (set) => set.attributes)
  attributeSets: AttributeSet[];

  @Field(() => Attribute)
  @OneToMany(
    () => ListingAttributes,
    (listingAttributes) => listingAttributes.attribute,
  )
  listingAttribute: ListingAttributes;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
