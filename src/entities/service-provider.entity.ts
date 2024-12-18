import { ObjectType, Field } from '@nestjs/graphql';
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
  @Index()
  @OneToOne(() => User, (user) => user.serviceProvider, { eager: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
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

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: ServiceProviderStatus.PENDING })
  @Field({ nullable: true })
  providerStatus: string;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => [ActivityLog])
  @OneToMany(
    () => ActivityLog,
    (servicesOffered) => servicesOffered.serviceProvider,
  )
  activityLog: ActivityLog[];

  @Field(() => [ServiceProvided])
  @OneToMany(() => ServiceProvided, (status) => status.service)
  servicesOffered: ServiceProvided[];

  @Field()
  @Column()
  coverageArea: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reason: string;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
