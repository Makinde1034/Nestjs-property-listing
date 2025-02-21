/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { IsEnum } from 'class-validator';
import { User } from './user.entity';
import { Listing } from './listing.entity';
import { ServiceProvidedStatus } from '../common/enums/service-provider';
import { Service } from './services.entity';

@Entity()
@ObjectType()
export class ServiceRequested extends BaseEntity {
  @Column()
  @Field()
  userId: string;

  @Column()
  @Field()
  listingId: string;

  @Column({ nullable: true })
  @Field()
  serviceId: string;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user)
  user: User;

  @Column()
  @Field()
  serviceProvidedId: string;

  @Field(() => Listing)
  @JoinColumn({ name: 'listingId' })
  @ManyToOne(() => Listing, (listing) => listing.serviceRequested)
  listing: Listing;

  @Field(() => Service)
  @JoinColumn({ name: 'serviceId' })
  @ManyToOne(() => Service, (service) => service, { nullable: true })
  service: Service;

  @Column({ default: ServiceProvidedStatus.PENDING })
  @Field()
  @IsEnum(ServiceProvidedStatus)
  status: string;

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
