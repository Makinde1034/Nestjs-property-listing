/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { RolePermissions } from './role-permission.entity';

@Entity()
@ObjectType()
export class Role {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  englishName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  arabicName: string;

  @Column()
  @Field()
  slug: string;

  @Field(() => [Permission])
  @ManyToMany(() => Permission, { cascade: true, eager: true })
  @JoinTable({ name: 'role_permissions_permission' })
  permissions: Permission[];

  @Field(() => [RolePermissions])
  @OneToMany(() => RolePermissions, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermissions[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
