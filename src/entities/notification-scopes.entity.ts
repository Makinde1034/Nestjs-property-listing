/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class NotificationScope {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  scopeGroup: string;
}
