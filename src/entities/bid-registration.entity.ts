import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
@ObjectType()
export class BidRegistration extends BaseEntity {
  @Column()
  @Field()
  autoBid: boolean;

  @Column()
  @Field()
  userId: string;

  @Column()
  @Field()
  auctionId: string;

  @Column()
  @Field()
  listingId: string;

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
