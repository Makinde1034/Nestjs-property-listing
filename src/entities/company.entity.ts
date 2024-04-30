/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { CompanyUser } from './company-user.entity';

@Entity()
@ObjectType()
export class Company extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  vatNumber: string;

  @Column()
  @Field()
  crNumber: string;

  @Field(() => CompanyUser)
  @OneToOne(() => CompanyUser, (user) => user.company, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: CompanyUser;
}
