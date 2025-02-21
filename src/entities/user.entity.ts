/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { UserLevel, UserProfileType } from '../common/types';
import * as bcrypt from 'bcrypt';
import { Gender, MaritalStatus, UserStatus } from '../common/enums';
import { NationalIdentity } from './identity.entity';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Company } from './company.entity';
import { UserNotificationPreference } from './notification-preference.entity';
import { Review } from './review.entity';
import { loadUserName } from '../common/utils/class-loader';
import { Listing } from './listing.entity';
import { Offer } from './offer.entity';
import { SearchHistory } from './search-history.entity';
import { Wishlist } from './wishlist.entity';
import { Messages } from './message.entity';
import { Chat } from './chat.entity';
import { FlagListing } from './flag-listing.entity';
import { Article } from './article.entity';
import { ActivityLog } from './activity-log.entity';
import { Compare } from './compare.entity';
import { ServiceProvider } from './service-provider.entity';
import { ActionRequest } from './request.action.entity';

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Column()
  @Field()
  userType: UserProfileType;

  @Column({ default: 'level_1' })
  @Field()
  userLevel: UserLevel;

  @Column({ default: 'v1' })
  @Field({ nullable: true })
  termsOfServiceVersion: string;

  @Column({ default: 'v1' })
  @Field({ nullable: true })
  currentTermOfservice: string;

  @Field(() => [ActionRequest])
  @OneToMany(() => ActionRequest, (request) => request.user)
  requests: ActionRequest[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicFirstName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicLastName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  age: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicMiddleName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  middleName: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ unique: true, nullable: true })
  @Field({ nullable: true })
  phone: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  verifiedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gender: Gender;

  @Field({ nullable: true })
  @Column({ nullable: true })
  crNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  zatcaNuber: string;

  @Field()
  @Column({ default: 'en' })
  language: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  maritalStatus: MaritalStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  occupation: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profilePhoto: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field()
  @Column({ default: false })
  autoBidEnable: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  biometricKey: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  twoFaRequired: boolean;

  @Column({ default: false })
  @Field({ nullable: true })
  isBlocked: boolean;

  @Column({ default: 'user' })
  @Field({ nullable: true })
  interface: string;

  @OneToOne(() => ServiceProvider, (serviceProvider) => serviceProvider.user)
  @Field(() => ServiceProvider)
  serviceProvider: ServiceProvider;

  @Field(() => [Review], { nullable: true })
  @OneToMany(() => Review, (review) => review.user, { cascade: true })
  review: Review[];

  @Field(() => [Listing], { nullable: true })
  @OneToMany(() => Listing, (listing) => listing.user, { cascade: true })
  listing: Listing[];

  @Field(() => [Offer], { nullable: true })
  @OneToMany(() => Offer, (offer) => offer.user, { cascade: true })
  offer: Offer[];

  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.user)
  activityLogs: ActivityLog[];

  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.user)
  adminActivityLogs: ActivityLog;

  @Field({ nullable: true, defaultValue: UserStatus.PENDING })
  @Column({ nullable: true, default: UserStatus.PENDING })
  status: UserStatus;

  @Field(() => [Messages])
  @OneToMany(() => Messages, (messages) => messages.user)
  messages: Messages[];

  @Field(() => Chat)
  @OneToMany(() => Chat, (chat) => chat.user)
  chat: Chat;

  @Column({ nullable: true })
  @Field({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  city: string;

  @Column({ default: false })
  @Field({ nullable: true })
  isDataVerified: boolean;

  @Field(() => [Article])
  @OneToMany(() => Article, (article) => article.user)
  article: Article[];

  @Field(() => NationalIdentity, { nullable: true })
  @OneToOne(() => NationalIdentity, (identity) => identity.user, {
    cascade: true,
    eager: true,
  })
  nationalIdentity?: NationalIdentity;

  @Field(() => Company, { nullable: true })
  @OneToOne(() => Company, (company) => company.user, {
    cascade: true,
    eager: true,
  })
  company?: Company;

  @Field(() => User, { nullable: true })
  @OneToOne(() => Compare, (compare) => compare.user)
  compare: Compare;

  @Field(() => [UserNotificationPreference], { nullable: true })
  @OneToMany(
    () => UserNotificationPreference,
    (preference) => preference.user,
    {
      cascade: true,
    },
  )
  notificationPreference: UserNotificationPreference[];

  @Field()
  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.user, {
    cascade: true,
  })
  searchHistory: SearchHistory;
  @Exclude()
  @Field({ nullable: true })
  @Column({ nullable: true })
  twoFactorAuthenticationSecret: string;

  @Field({ nullable: true, defaultValue: false })
  @Column({ nullable: true, default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @Field(() => [Role], { nullable: true })
  @ManyToMany(() => Role, (role) => role.user, { cascade: true })
  @JoinTable({ name: 'user_role_roles' })
  roles: Role[];

  @Field(() => Wishlist)
  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist;

  @Field(() => FlagListing)
  @OneToMany(() => FlagListing, (flagListing) => flagListing.reporter)
  flagListing: FlagListing;

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  employeeId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  disabledAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @Field(() => GraphQLISODateTime, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  notificationToken: string;

  @Field({ nullable: true })
  name: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Ignore if password already hashed (when updating)
    if (this.password.startsWith('$2b$')) {
      return;
    }
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @AfterLoad()
  loadFullname() {
    this.name = loadUserName(this);
  }
}
