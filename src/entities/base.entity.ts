/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Index, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
export default class BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;
}
