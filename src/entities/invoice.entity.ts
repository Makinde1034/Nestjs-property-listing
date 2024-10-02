/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { int } from 'aws-sdk/clients/datapipeline';

@Entity()
@ObjectType()
export class Invoice {
  @PrimaryGeneratedColumn()
  @Field()
  id: int;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field()
  price: number;

  @Column()
  @Field()
  userId: string;

  @Column({ default: 'offer' })
  @Field()
  type: string;

  @Column({ default: 'pending' })
  @Field()
  status: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  file: string;

  @Column({ default: 0 })
  @Field()
  vat: number;

  @Column()
  @Field()
  listingid: string;
  @Column()
  @Field()
  @CreateDateColumn()
  expireAt: Date;

  @Column()
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
