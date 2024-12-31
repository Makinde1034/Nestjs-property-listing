/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';
import { Listing } from './listing.entity';
import { ServiceProvidedStatus } from '../common/enums/service-provider';

@Entity()
@ObjectType()
export class ServiceRequested extends BaseEntity {
  @Column()
  @Field()
  userId: string;

  @Field(() => User)
  @JoinColumn({ name: 'userId' })
  @OneToOne(() => User, (user) => user)
  user: User;

  @Column()
  @Field()
  serviceProvidedId: string;

  @Field(() => [Listing])
  @OneToMany(() => Listing, (listing) => listing.serviceRequested)
  listing: Listing[];

  @Column({ default: ServiceProvidedStatus.PENDING })
  @Field()
  @IsEnum(ServiceProvidedStatus)
  status: string;

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
