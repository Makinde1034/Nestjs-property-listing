/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { NotificationScope } from './notification-scopes.entity';

@Entity()
@ObjectType()
export class AdminNotificationPreference extends BaseEntity {
  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  email: boolean;

  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  mobile: boolean;

  @Column({ nullable: true, default: true })
  @Field({ nullable: true, defaultValue: true })
  desktop: boolean;

  @ManyToOne(() => NotificationScope, { cascade: true, eager: true })
  @Field(() => NotificationScope)
  scope: NotificationScope;
}
