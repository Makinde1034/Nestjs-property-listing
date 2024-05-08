/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class UserNotificationPreference extends BaseEntity {
  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  email: boolean;

  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  sms: boolean;

  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  pushNotification: boolean;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.notificationPreference, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
