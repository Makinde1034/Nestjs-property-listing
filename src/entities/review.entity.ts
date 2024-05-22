/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */
import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Review extends BaseEntity {
  @Column()
  @Field()
  rating: number;

  @Column()
  @Field()
  type: string;

  @Column({ nullable: true })
  @Field()
  comment: string;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  @ManyToOne(() => User, (user) => user.reviewer)
  reviewer: User;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'service_owner_id' })
  @ManyToOne(() => User, (user) => user.service_owner)
  service_owner: User;

  @Column()
  @Field()
  reviewer_id: string;
  @Column()
  @Field()
  service_owner_id: string;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  @Field()
  updated_at: Date;
}
