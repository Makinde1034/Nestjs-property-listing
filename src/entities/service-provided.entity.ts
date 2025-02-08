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
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { ServiceProvider } from './service-provider.entity';
import { Service } from './services.entity';
import { ProviderServiceStatus } from '../common/enums/status.enum';

@ObjectType()
@Entity()
export class ServiceProvided extends BaseEntity {
  @Field(() => ServiceProvider)
  @ManyToOne(
    () => ServiceProvider,
    (servicesProvider) => servicesProvider.servicesOffered,
  )
  serviceProvider: ServiceProvider;

  @Field()
  @Column()
  serviceProviderId: string;

  @Field(() => Service)
  @JoinColumn({ name: 'serviceId' })
  @ManyToOne(() => Service, (services) => services.status, { eager: true })
  service: Service;

  @Field()
  @Column()
  serviceId: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: ProviderServiceStatus.INACTIVE })
  @Field({ nullable: true })
  status: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
