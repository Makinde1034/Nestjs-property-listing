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
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { ServiceProvided } from './service-provided.entity';
import { ServiceProviderStatus } from '../common/enums/status.enum';
import { ActivityLog } from './activity-log.entity';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class ServiceProvider extends BaseEntity {
  @Field({ nullable: true })
  @Column({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  arabicFirstName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  arabicLastName: string;

  @Index()
  @OneToOne(() => User, (user) => user.serviceProvider, { eager: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user: User;

  @Column()
  @Field()
  userId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ibanCertificate: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  workLicense: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  idOrCr: string;

  @Column()
  @Field({ nullable: true })
  iban: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: ServiceProviderStatus.PENDING })
  @Field({ nullable: true })
  providerStatus: string;

  @Field(() => GraphQLISODateTime)
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => [ActivityLog])
  @OneToMany(
    () => ActivityLog,
    (servicesOffered) => servicesOffered.serviceProvider,
  )
  activityLog: ActivityLog[];

  @Field(() => [ServiceProvided], { nullable: true })
  @OneToMany(
    () => ServiceProvided,
    (serviceProvided) => serviceProvided.serviceProvider,
    {
      eager: true,
      cascade: true,
    },
  )
  servicesOffered: ServiceProvided[];

  @Field()
  @Column()
  coverageArea: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reason: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
