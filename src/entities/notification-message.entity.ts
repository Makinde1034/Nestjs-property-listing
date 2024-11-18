/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';

import { Field, ObjectType } from '@nestjs/graphql';
@Entity()
@ObjectType()
export class NotificationMessages extends BaseEntity {
  @Field()
  @Column()
  scope: string;

  @Field()
  @Column()
  event: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  timing: string;

  @Field()
  @Column()
  email: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  emailTemplate: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon: string;

  @Field()
  @Column()
  pushNotification: boolean;

  @Field()
  @Column()
  systemNotification: boolean;

  @Field()
  @Column()
  recipients: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  body: string;

  @Field()
  @Column()
  arabicTitle: string;

  @Field()
  @Column()
  arabicBody: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
