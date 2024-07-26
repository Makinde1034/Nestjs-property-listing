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

@Module({
  imports: [FilehandlerModule],
  providers: [PaymentResolver, PaymentService, InvoiceRepository],
  controllers: [PaymentController],
  exports: [InvoiceRepository, PaymentService],
})
export class PaymentModule {}
