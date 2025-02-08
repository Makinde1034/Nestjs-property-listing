/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Promotion } from './promotion.entity';

@ObjectType()
@Entity()
export class AdPackage {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Column({ nullable: true })
  @Field()
  impression: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column()
  coverageRadius: string;

  @Field()
  @Column({ nullable: true })
  price: number;

  @Field()
  @Column()
  duration: string;

  @Field(() => [Promotion])
  @OneToMany(() => Promotion, (promotion) => promotion.adPackage)
  promotion: Promotion[];

  @Field(GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
