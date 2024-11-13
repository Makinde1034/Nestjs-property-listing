/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Listing } from './listing.entity';
import { AuctionParticipant } from './auction-participant.entity';
@Entity()
@ObjectType()
export class Bids {
  @PrimaryGeneratedColumn('uuid')
  @Field({ nullable: true })
  id: string;

  @Column()
  @Field()
  userId: string;

  @Column()
  @Field()
  bidNumber: number;

  @Column('decimal', { precision: 12, scale: 2 })
  @Field({ nullable: true })
  price: number;

  @Column()
  @Field()
  auctionId: string;

  @Field(() => Listing)
  @JoinColumn({ name: 'auctionParticipantId' })
  @ManyToOne(
    () => AuctionParticipant,
    (auctionParticipant) => auctionParticipant.bid,
  )
  auctionParticipant: AuctionParticipant;

  @Column({ nullable: true })
  @Field()
  auctionParticipantId: string;

  @Column()
  @Field()
  listingId: string;

  @Column({ default: false })
  @Field()
  autoBid: boolean;

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
