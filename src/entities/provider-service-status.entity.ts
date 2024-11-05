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
import { Service } from './services.entity';
import { ProviderServiceStatus } from '../common/enums/status.enum';

@ObjectType()
@Entity()
export class ServiceStatus extends BaseEntity {
  @Field(() => ServiceProvider)
  @JoinColumn({ name: 'serviceProviderId' })
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
  @OneToOne(() => Service, (services) => services.status)
  service: Service;

  @Field()
  @Column()
  serviceId: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: ProviderServiceStatus.INACTIVE })
  @Field({ nullable: true })
  status: string;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
