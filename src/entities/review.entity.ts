/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import { IsEnum } from 'class-validator';
import { ServicesOffered } from '../common/enums';

@Entity()
@ObjectType()
export class Review extends BaseEntity {
  @Column()
  @Field()
  rating: number;

  @Column({ nullable: true })
  @Field()
  comment: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.review)
  user: User;

  @Column()
  @Field()
  userId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  providerId: string;

  @Column()
  @Field()
  @IsEnum(ServicesOffered)
  reviewType: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt: Date;
}
