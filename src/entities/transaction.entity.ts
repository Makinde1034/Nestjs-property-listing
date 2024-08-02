/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity('general_ledger')
export class GeneralLedger extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  accountNumber: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['debit', 'credit'] })
  transactionType: 'debit' | 'credit';

  @Column({ type: 'varchar', length: 50 })
  reference: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  saiiFee: number;

  @Column()
  status: string;

  @Column()
  needAdminReview: boolean;

  @Column()
  offerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
