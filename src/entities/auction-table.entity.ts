/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { AuctionParticipant } from './auction-participant.entity';
@ObjectType()
@Entity()
export class Auction extends BaseEntity {
  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  description: string;

  @Column()
  @Field()
  startDate: Date;

  @Column()
  @Field()
  liveFor: number;

  @Column()
  @Field()
  maxListing: number;

  @Field(() => [AuctionParticipant])
  @OneToMany(
    () => AuctionParticipant,
    (auctionParticipant) => auctionParticipant.auction,
  )
  auctionParticipant: AuctionParticipant[];

  @Column({ default: false })
  @Field({ defaultValue: false })
  status: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
