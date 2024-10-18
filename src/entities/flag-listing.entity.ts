/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Listing } from './listing.entity';
import { User } from './user.entity';
import { ChildIssue } from './child-issue.entity';
import { ParentIssue } from './parent-issue.entity';
@Entity()
@ObjectType()
export class FlagListing extends BaseEntity {
  @Field()
  @Column()
  userId: string;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (reporter) => reporter.flagListing, { eager: true })
  reporter: User;

  @Field(() => ParentIssue)
  @JoinColumn({ name: 'parentIssueId' })
  @ManyToOne(() => ParentIssue, (parentIssue) => parentIssue.flagListing, {
    cascade: true,
  })
  parentIssue: ParentIssue;

  @Field(() => ChildIssue, { nullable: true })
  @JoinColumn({ name: 'childIssueId' })
  @ManyToOne(() => ChildIssue, (childIssue) => childIssue.flagListing, {
    cascade: true,
  })
  childIssue: ChildIssue;
  @Field()
  @Column()
  listingId: string;

  @Field(() => Listing, { nullable: true })
  @JoinColumn({ name: 'listingId' })
  @ManyToOne(() => Listing, (listing) => listing.flag, { eager: true })
  listing: Listing;

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
