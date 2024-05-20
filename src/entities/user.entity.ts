/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
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
import { Field, ObjectType } from '@nestjs/graphql';
import { UserProfileType } from '../common/types';
import * as bcrypt from 'bcrypt';
import { Gender, MaritalStatus, UserStatus } from '../common/enums';
import { NationalIdentity } from './identity.entity';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Company } from './company.entity';
import { UserNotificationPreference } from './notification-preference.entity';
import { Review } from './review.entity';

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Column()
  @Field()
  userType: UserProfileType;

  @Column({ nullable: true })
  @Field({ nullable: true })
  firstName: string;

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

  @Field({ nullable: true })
  @Column({ nullable: true })
  verifiedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gender: Gender;

  @Field({ nullable: true })
  @Column({ nullable: true })
  language: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  maritalStatus: MaritalStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  occupation: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  biometricKey: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  twoFaRequired: boolean;

  @Field(() => [Review], { nullable: true })
  @OneToMany(() => Review, (review) => review.reviewer, { cascade: true })
  reviewer: Review[];

  @Field(() => [Review], { nullable: true })
  @OneToMany(() => Review, (review) => review.service_owner, { cascade: true })
  service_owner: Review[];

  @Field({ nullable: true, defaultValue: UserStatus.PENDING })
  @Column({ nullable: true, default: UserStatus.PENDING })
  status: UserStatus;

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

  @Field(() => UserNotificationPreference, { nullable: true })
  @OneToOne(() => UserNotificationPreference, (preference) => preference.user, {
    cascade: true,
    eager: true,
  })
  notificationPreference: UserNotificationPreference;

  @Exclude()
  @Field({ nullable: true })
  @Column({ nullable: true })
  twoFactorAuthenticationSecret: string;

  @Field({ nullable: true, defaultValue: false })
  @Column({ nullable: true, default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @Exclude()
  @Field(() => [Role], { nullable: true })
  @ManyToMany(() => Role, { cascade: true, eager: true })
  @JoinTable({ name: 'user_role_roles' })
  roles: Role[];

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  employeeId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  disabledAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @Field({ nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  notificationToken: string;

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
}
