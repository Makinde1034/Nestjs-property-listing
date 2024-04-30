/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { AfterLoad, ChildEntity, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';

@ChildEntity('company')
@ObjectType()
export class CompanyUser extends User {
  @Field(() => Company, { nullable: true })
  @OneToOne(() => Company, (company) => company.user, {
    cascade: true,
    eager: true,
  })
  company?: Company;

  @AfterLoad()
  loadProfileType? = () => {
    this.userType = 'company';
  };
}
