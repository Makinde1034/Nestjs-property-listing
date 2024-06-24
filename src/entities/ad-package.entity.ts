/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field } from '@nestjs/graphql';
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

  @Column()
  @Field({ nullable: true })
  impression: string;

  @Field()
  @Column({ nullable: true })
  coverageRadius: string;

  @Field()
  @Column()
  price: string;

  @Field()
  @Column()
  duration: string;

  @Field(() => [Promotion])
  @OneToMany(() => Promotion, (promotion) => promotion.adPackage)
  promotion: Promotion[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
