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
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { AttributeSet } from './attribute-set.entity';

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

  @Column()
  @Field()
  showInComparison: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  isAmenities: boolean;

  @Column()
  @Field()
  showInFilters: boolean;

  @Field(() => [AttributeSet])
  @ManyToMany(() => AttributeSet, (set) => set.attributes)
  attributeSets: AttributeSet[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
