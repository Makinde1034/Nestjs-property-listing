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

  @Column()
  @Field()
  slug: string;

  @Column()
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

  @Column({ nullable: true })
  @Field()
  approveFlag: boolean;

  @Column({ nullable: true })
  @Field()
  useFlag: boolean;

  @Column({ nullable: true })
  @Field()
  staffAccess: boolean;

  @Column({ nullable: true })
  @Field()
  individualAccess?: boolean;

  @Column({ nullable: true })
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
