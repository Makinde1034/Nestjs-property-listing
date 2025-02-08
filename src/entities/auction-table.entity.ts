/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

import BaseEntity from './base.entity';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { AuctionParticipant } from './auction-participant.entity';
import { IsEnum } from 'class-validator';
import { AuctionEnum } from '../common/enums/status.enum';
import { ActivityLog } from './activity-log.entity';

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

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  @Field({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  liveFor: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  imageLink: string;

  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.splashScreen)
  actionActivityLog: ActivityLog[];

  @Column()
  @Field()
  maxListing: number;

  @Field()
  auctionParticipantCount: number;

  @Field(() => [AuctionParticipant])
  @OneToMany(
    () => AuctionParticipant,
    (auctionParticipant) => auctionParticipant.auction,
  )
  auctionParticipant: AuctionParticipant[];

  @Column({ default: 'inactive' })
  @Field({ defaultValue: false })
  @IsEnum(AuctionEnum)
  status: string;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  @Index()
  expireAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
