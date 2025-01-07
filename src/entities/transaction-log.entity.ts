/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

// Import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Import BaseEntity from './base.entity';
// Import { PaymentStatus } from '../common/enums/status.enum';
// Import { Field, ObjectType } from '@nestjs/graphql';

// @Entity()
// @ObjectType()
// Export class TransactionLog extends BaseEntity {
//   @Column('decimal', { precision: 10, scale: 2 })
//   @Field()
//   Amount: number;
//   @Column('decimal', { precision: 10, scale: 2 })
//   @Field()
//   Fee: number;

//   @Column('decimal', { precision: 10, scale: 2 })
//   @Field()
//   Vat: number;

//   @Column({
//     Type: 'enum',
//     Enum: PaymentStatus,
//     Default: PaymentStatus.PENDING,
//   })
//   @Field()
//   Status: PaymentStatus;

//   @Column()
//   @Field()
//   Reference: string;

//   @Column()
//   @Field()
//   Category: string;

//   @UpdateDateColumn()
//   @Field()
//   UpdatedAt: Date;
//   @CreateDateColumn()
//   @Field()
//   CreatedAt: Date;
// }
