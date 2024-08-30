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
  @Field()
  functionDescription: string;

  @Column({ nullable: true })
  @Field()
  slug: string;

  @Column({ nullable: true })
  @Field()
  category: string;

  @Column({ nullable: true })
  @Field()
  remarks: string;

  @Column({ nullable: true })
  @Field()
  arabicLabel: string;

  @Column({ nullable: true })
  @Field()
  englishLabel: string;

  @Column({ default: false })
  @Field({ defaultValue: false, nullable: true })
  approveFlag?: boolean;

  @Column({ default: true })
  @Field()
  useFlag: boolean;

  @Column({ default: true })
  @Field()
  staffAccess: boolean;

  @Column({ default: false, nullable: true })
  @Field()
  individualAccess?: boolean;

  @Column({ default: false, nullable: true })
  @Field()
  companyAccess: boolean;

  @Field(() => [RolePermissions])
  @OneToMany(
    () => RolePermissions,
    (rolePermission) => rolePermission.permission,
    { eager: true },
  )
  permissionRoles: RolePermissions[];
}
