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
import { ServiceProvided } from '../common/enums/status.enum';
import { User } from './user.entity';
import { Listing } from './listing.entity';

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

  @Column({ default: ServiceProvided.PENDING })
  @Field()
  @IsEnum(ServiceProvided)
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
