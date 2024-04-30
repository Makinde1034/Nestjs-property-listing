/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { AfterLoad, ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';

@ChildEntity('staff')
@ObjectType()
export class Staff extends User {
  @Exclude()
  @Field(() => [Role])
  @ManyToMany(() => Role, { cascade: true, eager: true })
  @JoinTable({ name: 'user_role_roles' })
  roles: Role[];

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  employeeId: string;

  @AfterLoad()
  loadProfileType? = () => {
    this.userType = 'staff';
  };
}
