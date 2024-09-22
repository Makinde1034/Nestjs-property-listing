/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import BaseEntity from './base.entity';
import { PaymentStatus } from '../common/enums/status.enum';
import { Field } from '@nestjs/graphql';

@Entity()
export class Transaction extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2 })
  @Field()
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field()
  fee: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field()
  vat: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Field()
  status: PaymentStatus;

  @Column()
  @Field()
  reference: string;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
