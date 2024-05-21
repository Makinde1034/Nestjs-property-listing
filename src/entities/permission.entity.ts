/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermissions } from './role-permission.entity';

@Entity()
@ObjectType()
export class Permission {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  slug: string;

  @Column()
  @Field()
  permissionGroup: string;

  @Column({ default: true })
  @Field()
  visible: boolean;

  @Field(() => [RolePermissions])
  @OneToMany(
    () => RolePermissions,
    (rolePermission) => rolePermission.permission,
    { eager: true },
  )
  permissionRoles: RolePermissions[];
}
