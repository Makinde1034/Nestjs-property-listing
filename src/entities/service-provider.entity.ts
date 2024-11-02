import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Service } from './services.entity';
import { ServiceStatus } from './provider-service-status.entity';
import { ServiceProviderStatus } from '../common/enums/status.enum';
import { ActivityLog } from './activity-log.entity';

@ObjectType()
@Entity()
export class ServiceProvider extends BaseEntity {
  @Column()
  @Field()
  firstName: string;

  @Column()
  @Field()
  lastName: string;

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

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: ServiceProviderStatus.PENDING })
  @Field({ nullable: true })
  providerStatus: string;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => [Service])
  @OneToMany(() => Service, (servicesOffered) => servicesOffered.service)
  serviceOffered: Service[];

  @Field(() => [ActivityLog])
  @OneToMany(
    () => ActivityLog,
    (servicesOffered) => servicesOffered.serviceProvider,
  )
  activityLog: ActivityLog[];

  @Field(() => [ServiceStatus])
  @OneToMany(() => ServiceStatus, (status) => status.service)
  status: ServiceStatus[];

  @Field()
  @Column()
  coverageArea: string;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
