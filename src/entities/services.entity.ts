import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { ServiceProvider } from './service-provider.entity';
import { ServiceStatus } from './provider-service-status.entity';

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

  @Field(() => ServiceStatus)
  @OneToOne(() => ServiceStatus, (status) => status.service)
  status: ServiceStatus;

  @Field(() => ServiceProvider)
  @JoinColumn({ name: 'servicePrividerId' })
  @ManyToOne(
    () => ServiceProvider,
    (servicesProvider) => servicesProvider.serviceOffered,
  )
  service: ServiceProvider[];

  @Field()
  @Column()
  servicePrividerId: string;

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
