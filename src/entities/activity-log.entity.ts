import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
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

@Entity()
@ObjectType()
export class ActivityLog extends BaseEntity {
  @Field(() => User, { nullable: true })
  @JoinTable({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.activityLogs)
  user: User;

  @Field(() => User, { nullable: true })
  @JoinTable({ name: 'adminId' })
  @ManyToOne(() => User, (user) => user.adminActivityLogs)
  admin: User;

  @Field(() => Role, { nullable: true })
  @JoinTable({ name: 'roleId' })
  @ManyToOne(() => Role, (role) => role.activityLogs)
  role: Role;

  @Field(() => ListingType, { nullable: true })
  @JoinTable({ name: 'listingTypeId' })
  @ManyToOne(() => ListingType, (role) => role.listingTypeActivityLogs)
  listingType: ListingType;

  @Field(() => Listing, { nullable: true })
  @JoinTable({ name: 'listingId' })
  @ManyToOne(() => Listing, (listing) => listing.listingActivityLogs)
  listing: Listing;

  @Field(() => ResponseTemplate, { nullable: true })
  @JoinTable({ name: 'responseTemplateId' })
  @ManyToOne(
    () => ResponseTemplate,
    (responseTemplate) => responseTemplate.responseTemplateActivityLogs,
  )
  responseTemplate: ResponseTemplate;

  @Field(() => Ticket, { nullable: true })
  @JoinTable({ name: 'ticketId' })
  @ManyToOne(() => Ticket, (ticket) => ticket.ticketActivityLog)
  ticket: Ticket;

  @Field(() => Article, { nullable: true })
  @JoinTable({ name: 'articleId' })
  @ManyToOne(() => Article, (article) => article.articleActivityLog)
  article: Article;

  @Field(() => SplashScreen, { nullable: true })
  @JoinTable({ name: 'splashScreenId' })
  @ManyToOne(
    () => SplashScreen,
    (splashScreen) => splashScreen.splashScreenActivityLog,
  )
  splashScreen: SplashScreen;

  @Field(() => Auction, { nullable: true })
  @JoinTable({ name: 'auctionId' })
  @ManyToOne(() => Auction, (auction) => auction.actionActivityLog)
  auction: Auction;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId: string;

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
