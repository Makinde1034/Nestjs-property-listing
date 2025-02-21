/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import { NotificationType } from '../common/enums';

@Entity()
@ObjectType()
export class Notification extends BaseEntity {
  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  message: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  metadata: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  category: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  img: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  subCategory: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true, defaultValue: false })
  read: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  type: NotificationType;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  expiredAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  directToWeb: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  directToMobile: boolean;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient: User;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
