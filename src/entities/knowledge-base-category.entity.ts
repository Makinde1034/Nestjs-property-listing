/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';

@Entity()
@ObjectType()
export class Category {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  arabicName: string;

  @Column()
  @Field()
  englishName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  placement: string;

  @Field(() => [Article], { nullable: true })
  @OneToMany(() => Article, (article) => article.category)
  article: Article[];

  @Column()
  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;
}
