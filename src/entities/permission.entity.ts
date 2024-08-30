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

  @Column({ nullable: true })
  @Field({ nullable: true })
  functionDescription: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  slug?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  category: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  remarks?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicLabel?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  englishLabel?: string;

  @Column({ default: false, nullable: true })
  @Field({ defaultValue: false, nullable: true })
  approveFlag?: boolean;

  @Column({ default: true })
  @Field({ defaultValue: true, nullable: true })
  useFlag?: boolean;

  @Column({ default: true })
  @Field({ defaultValue: true })
  staffAccess?: boolean;

  @Column({ default: false, nullable: true })
  @Field({ defaultValue: false })
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
