/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType } from '@nestjs/graphql';
import { AfterLoad, ChildEntity } from 'typeorm';
import { User } from './user.entity';

@ChildEntity('individual')
@ObjectType()
export class IndividualUser extends User {
  @AfterLoad()
  loadProfileType? = () => {
    this.userType = 'individual';
  };
}
