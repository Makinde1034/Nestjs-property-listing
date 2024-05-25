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
  id?: number;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  slug?: string;

  @Column()
  @Field()
  permissionGroup: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  remarks?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicLabel?: string;

  @Column({ default: false, nullable: true })
  @Field({ defaultValue: false, nullable: true })
  approveFlag?: boolean;

  @Column({ default: true, nullable: true })
  @Field({ defaultValue: true, nullable: true })
  useFlag?: boolean;

  @Column({ default: true, nullable: true })
  @Field({ defaultValue: true, nullable: true })
  staffAccess?: boolean;

  @Column({ default: false, nullable: true })
  @Field({ defaultValue: false, nullable: true })
  individualAccess?: boolean;

  @Column({ default: false, nullable: true })
  @Field({ defaultValue: false, nullable: true })
  companyAccess?: boolean;

  @Field(() => [RolePermissions])
  @OneToMany(
    () => RolePermissions,
    (rolePermission) => rolePermission.permission,
    { eager: true },
  )
  permissionRoles: RolePermissions[];
}
