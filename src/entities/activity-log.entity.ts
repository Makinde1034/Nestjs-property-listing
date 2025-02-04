/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';
import { ListingType } from './listing-type.entity';
import { Listing } from './listing.entity';
import { ResponseTemplate } from './response-template.entity';
import { Ticket } from './ticket.entity';
import { Article } from './article.entity';
import { SplashScreen } from './splash-screen.entity';
import { Auction } from './auction-table.entity';
import { ServiceProvider } from './service-provider.entity';
import { Service } from './services.entity';
@Entity()
@ObjectType()
export class ActivityLog extends BaseEntity {
  @Field(() => User, { nullable: true })
  @Index()
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.activityLogs)
  user: User;

  @Field(() => User, { nullable: true })
  @Index()
  @JoinColumn({ name: 'adminId' })
  @ManyToOne(() => User, (user) => user.adminActivityLogs)
  admin: User;

  @Field(() => Role, { nullable: true })
  @Index()
  @JoinColumn({ name: 'roleId' })
  @ManyToOne(() => Role, (role) => role.activityLogs)
  role: Role;

  @Field(() => ListingType, { nullable: true })
  @Index()
  @JoinColumn({ name: 'listingTypeId' })
  @ManyToOne(() => ListingType, (role) => role.listingTypeActivityLogs)
  listingType: ListingType;

  @Field(() => Listing, { nullable: true })
  @Index()
  @JoinColumn({ name: 'listingId' })
  @ManyToOne(() => Listing, (listing) => listing.listingActivityLogs)
  listing: Listing;

  @Field(() => ResponseTemplate, { nullable: true })
  @Index()
  @JoinColumn({ name: 'responseTemplateId' })
  @ManyToOne(
    () => ResponseTemplate,
    (responseTemplate) => responseTemplate.responseTemplateActivityLogs,
  )
  responseTemplate: ResponseTemplate;

  @Field(() => Ticket, { nullable: true })
  @Index()
  @JoinColumn({ name: 'ticketId' })
  @ManyToOne(() => Ticket, (ticket) => ticket.ticketActivityLog)
  ticket: Ticket;

  @Field(() => Article, { nullable: true })
  @Index()
  @JoinColumn({ name: 'articleId' })
  @ManyToOne(() => Article, (article) => article.articleActivityLog)
  article: Article;

  @Field(() => ServiceProvider, { nullable: true })
  @Index()
  @JoinColumn({ name: 'serviceProviderId' })
  @ManyToOne(() => ServiceProvider, (serviceProvider) => serviceProvider)
  serviceProvider: ServiceProvider;

  @Field({ nullable: true })
  @Column({ nullable: true })
  serviceProviderId: string;

  @Field(() => SplashScreen, { nullable: true })
  @Index()
  @JoinColumn({ name: 'splashScreenId' })
  @ManyToOne(
    () => SplashScreen,
    (splashScreen) => splashScreen.splashScreenActivityLog,
  )
  splashScreen: SplashScreen;

  @Field(() => Auction, { nullable: true })
  @Index()
  @JoinColumn({ name: 'auctionId' })
  @ManyToOne(() => Auction, (auction) => auction.actionActivityLog)
  auction: Auction;

  @Field(() => Service, { nullable: true })
  @JoinColumn({ name: 'serviceId' })
  @ManyToOne(() => Service, (service) => service)
  service: Service;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  serviceId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  auctionId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  adminId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ticketId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  roleId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  attributeId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  attributeSetId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  listingTypeId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  responseTemplateId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  listingId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  articleId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  splashScreenId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  workflowId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  couponId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  placement: string;

  @Column()
  @Field({ nullable: true })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => String, { nullable: true })
  details: string;

  @Field({ nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
