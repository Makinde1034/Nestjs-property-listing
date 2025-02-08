/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
@Entity()
@ObjectType()
export class NotificationMessages extends BaseEntity {
  @Field()
  @Column()
  scope: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  event: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  directToWeb: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  directToMobile: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  timing: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  period: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  emailTemplate: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  pushNotification: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  systemNotification: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  recipients: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  body: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  arabicTitle: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  arabicBody: string;

  @CreateDateColumn()
  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt: Date;
}
