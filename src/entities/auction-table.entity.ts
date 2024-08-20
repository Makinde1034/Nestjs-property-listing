/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
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
  titleInEnglish: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  titleInArabic: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicDescription: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  englishDescription: string;

  @Column()
  @Field()
  startDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  liveFor: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  imageLink: string;

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

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
