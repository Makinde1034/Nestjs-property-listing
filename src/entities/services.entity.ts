/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field } from '@nestjs/graphql';
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

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
