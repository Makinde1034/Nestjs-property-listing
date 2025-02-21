/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';
import { NationalIdentityType } from '../common/enums';

@Entity()
@ObjectType()
export class NationalIdentity extends BaseEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  type: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  identityNumber: string;

  @Column({ nullable: true })
  @Field(() => GraphQLISODateTime, { nullable: true })
  dateOfExpiry: Date;

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, (user) => user.nationalIdentity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
