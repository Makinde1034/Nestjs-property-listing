/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { AfterLoad, ChildEntity, JoinTable, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';

@ChildEntity('admin')
@ObjectType()
export class Admin extends User {
  @Exclude()
  @Field(() => [Role])
  @ManyToMany(() => Role, { cascade: true, eager: true })
  @JoinTable({ name: 'user_role_roles' })
  roles: Role[];

  @AfterLoad()
  loadProfileType? = () => {
    this.userType = 'admin';
  };
}
