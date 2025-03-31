/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
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
import { User } from './user.entity';
@Entity()
@ObjectType()
export class Bids {
  @PrimaryGeneratedColumn('uuid')
  @Field({ nullable: true })
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bidNumber: number;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.bids)
  user: User;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bidderNumber: string;

  @Column('decimal', { precision: 12, scale: 2 })
  @Field({ nullable: true })
  price: number;

  @Column()
  @Field({ nullable: true })
  auctionId: string;

  @Field(() => Listing, { nullable: true })
  @JoinColumn({ name: 'auctionParticipantId' })
  @ManyToOne(
    () => AuctionParticipant,
    (auctionParticipant) => auctionParticipant.bid,
  )
  auctionParticipant: AuctionParticipant;

  @Column({ nullable: true })
  @Field({ nullable: true })
  auctionParticipantId: string;

  @Column()
  @Field({ nullable: true })
  listingId: string;

  @Column({ default: false })
  @Field({ nullable: true })
  autoBid: boolean;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
