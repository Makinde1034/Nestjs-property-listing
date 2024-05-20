/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity()
@ObjectType()
export class Role {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  slug: string;

  @Field(() => [Permission])
  @ManyToMany(() => Permission, { cascade: true, eager: true })
  @JoinTable({ name: 'role_permissions_permission' })
  permissions: Permission[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
