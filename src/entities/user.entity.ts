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
  OneToOne,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserProfileType } from '../common/types';
import * as bcrypt from 'bcrypt';
import { Gender, MaritalStatus, UserStatus } from 'src/common/enums';
import { NationalIdentity } from './identity.entity';

@Entity()
@ObjectType()
@TableInheritance({
  column: { type: 'varchar', name: 'userType', select: true },
})
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

  @Field({ nullable: true, defaultValue: UserStatus.PENDING })
  @Column({ nullable: true, default: UserStatus.PENDING })
  status: UserStatus;

  @Field(() => NationalIdentity, { nullable: true })
  @OneToOne(() => NationalIdentity, (identity) => identity.user, {
    cascade: true,
    eager: true,
  })
  nationalIdentity?: NationalIdentity;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
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
