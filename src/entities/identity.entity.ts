/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';

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
  @Field({ nullable: true })
  dateOfExpiry: Date;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.nationalIdentity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
