/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ChildIssue } from './child-issue.entity';
import BaseEntity from './base.entity';
import { Ticket } from '.';
import { FlagListing } from './flag-listing.entity';

@Entity()
@ObjectType()
export class ParentIssue extends BaseEntity {
  @Column()
  @Field()
  placement: string;

  @Field(() => [Ticket], { nullable: true })
  @OneToMany(() => Ticket, (childIssue) => childIssue.parentIssue)
  ticket: Ticket[];

  @Field(() => [ChildIssue], { nullable: true })
  @OneToMany(() => ChildIssue, (childIssue) => childIssue.parentIssue)
  childIssue: ChildIssue[];

  @Field(() => [FlagListing], { nullable: true })
  @OneToMany(() => FlagListing, (flagListing) => flagListing.parentIssue)
  flagListing: FlagListing[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  englishName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  sequentialId: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicName: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;
}
