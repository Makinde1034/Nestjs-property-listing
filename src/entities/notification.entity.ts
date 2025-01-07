/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
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
  subCategory: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true, defaultValue: false })
  read: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  type: NotificationType;

  @Column({ nullable: true })
  @Field({ nullable: true })
  expiredAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  directToWeb: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  directToMobile: boolean;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
