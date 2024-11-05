/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './knowledge-base-category.entity';
import { ActivityLog } from './activity-log.entity';

@ObjectType()
@Entity()
export class Article {
  @Field(() => Int, { description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  content: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  image: string;

  @Column()
  @Field()
  title: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  authorImage: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.article)
  user: User;

  @Column({ nullable: true })
  @Field({ nullable: true })
  authorBio: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.article)
  category: Category;

  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.ticket)
  articleActivityLog: ActivityLog[];

  @Column()
  @Field()
  language: string;

  @Column()
  @Field()
  placement: string;

  @Column({ default: false })
  @Field()
  published: boolean;

  @Column()
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Field()
  @CreateDateColumn()
  deletedAt: Date;
}
