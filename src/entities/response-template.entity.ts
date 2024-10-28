/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { ActivityLog } from './activity-log.entity';

@Entity()
@ObjectType()
export class ResponseTemplate extends BaseEntity {
  @Column()
  @Field()
  templateName: string;

  @Column()
  @Field()
  templateArabicName: string;

  @Column()
  @Field()
  templateText: string;
  @Column()
  @Field()
  templateArabicText: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.responseTemplate)
  responseTemplateActivityLogs: ActivityLog;

  @DeleteDateColumn()
  @Field()
  deletedAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
