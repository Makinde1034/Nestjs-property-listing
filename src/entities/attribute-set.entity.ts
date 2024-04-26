/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Attribute } from './attribute.entity';

@Entity()
@ObjectType()
export class AttributeSet extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Field(() => [Attribute])
  @ManyToMany(() => Attribute, (attribute) => attribute.attributeSets, {
    cascade: true,
    eager: true,
  })
  @JoinTable({ name: 'attributes_attribute_set' })
  attributes: Attribute[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
