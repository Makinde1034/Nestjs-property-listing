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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './knowledge-base-category.entity';

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

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.article)
  user: User;

  @Column({ nullable: true })
  @Field({ nullable: true })
  authorBio: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.article)
  category: Category;

  @Column()
  @Field()
  language: string;

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
