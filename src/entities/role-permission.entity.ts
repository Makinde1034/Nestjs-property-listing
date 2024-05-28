/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'role_permissions_permission' })
@ObjectType()
export class RolePermissions {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Role)
  @ManyToOne(() => Role, (role) => role.rolePermissions)
  role: Role;

  @Field(() => Permission)
  @ManyToOne(() => Permission, (permission) => permission.permissionRoles)
  permission: Permission;

  @Field({ nullable: true })
  @Column({ default: false, nullable: true })
  approve: boolean;
}
