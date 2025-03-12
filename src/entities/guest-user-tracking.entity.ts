/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */
import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
export class UserTracking extends BaseEntity {
  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  numberOfVisit: number;

  @Column()
  pageVisited: string;

  @Column({ default: 'guest' })
  type: string;

  @CreateDateColumn()
  visitTime: Date;

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
