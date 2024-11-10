/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentResolver } from './resolver/payment.resolver';
import { FilehandlerModule } from '../file-handler/file-handler.module';
import { PaymentController } from './controller/payment.controller';
import { InvoiceRepository } from './repositories/invoice.repository';
import { HttpModule } from '@nestjs/axios';
import { HyperPayService } from './service-providers/hyper-pay.service';
import { AdminRepository } from '../admin/repositories/admin.repository';
import { InvoiceService } from './services/invoice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRepository } from './repository/transaction.repository';
import { TransactionLog } from '../../entities/transaction-log.entity';
import { GeneralLedger } from '../../entities/general-ledger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionLog, GeneralLedger]),
    FilehandlerModule,
    HttpModule,
  ],
  providers: [
    PaymentResolver,
    PaymentService,
    InvoiceRepository,
    HyperPayService,
    AdminRepository,
    InvoiceService,
    TransactionRepository,
  ],
  controllers: [PaymentController],
  exports: [InvoiceRepository, PaymentService, HyperPayService, InvoiceService],
})
export class PaymentModule {}
