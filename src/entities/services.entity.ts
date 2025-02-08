/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { ServiceProvided } from './service-provided.entity';

@ObjectType()
@Entity()
export class Service extends BaseEntity {
  @Column()
  @Field()
  englishServiceName: string;

  @Column()
  @Field()
  arabicServiceName: string;

  @Column({ default: false })
  @Field({ nullable: true })
  active: boolean;

  @Column({ default: false })
  @Field({ nullable: true })
  isWorkLicenseRequired: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  icon: string;

  @Column()
  @Field({ nullable: true })
  pricing: string;

  @Field(() => [ServiceProvided], { nullable: true })
  @OneToMany(() => ServiceProvided, (status) => status.service)
  status: ServiceProvided[];

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
