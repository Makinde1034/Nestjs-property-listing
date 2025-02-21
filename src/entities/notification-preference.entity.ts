/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';
import { NotificationScope } from './notification-scopes.entity';

@Entity()
@ObjectType()
export class UserNotificationPreference extends BaseEntity {
  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  email: boolean;

  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  mobile: boolean;

  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  desktop: boolean;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.notificationPreference, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => NotificationScope, { cascade: true, eager: true })
  @Field(() => NotificationScope, { nullable: true })
  scope: NotificationScope;
}
