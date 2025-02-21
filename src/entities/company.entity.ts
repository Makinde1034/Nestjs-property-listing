/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Company extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  vatNumber: string;

  @Column()
  @Field()
  crNumber: string;

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, (user) => user.company, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
