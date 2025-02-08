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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Entity()
@ObjectType()
export class SplashScreen {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  title: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  placement: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  image: string;

  @Column({ default: false })
  @Field()
  default: boolean;

  @Column()
  @Field(() => GraphQLISODateTime, { nullable: true })
  startDate: Date;

  @Column()
  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate: Date;

  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.splashScreen)
  splashScreenActivityLog: ActivityLog;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
