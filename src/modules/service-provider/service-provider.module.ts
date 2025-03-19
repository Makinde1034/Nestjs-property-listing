/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';

import { ServiceAndProviderResolver } from './resolver/service-provider.resolver';
import { ServiceProviderRepository } from './repository/service-provider.repository';
import { ServiceRepository } from './repository/services.repository';

import { ServiceProvidedRepository } from './repository/service-provided.repository';
import { ServiceAndProviderService } from './services/service-provider.service';
import { ServiceRequestedRepository } from './repository/requested-service.repository';
import { ServiceProviderController } from './controller/servic-provider.controller';
import { PaymentService } from '../payment/services/payment.service';
import { InvoiceRepository } from '../payment/repositories/invoice.repository';
import { HyperPayService } from '../payment/service-providers/hyper-pay.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [ServiceProviderController],
  providers: [
    ServiceAndProviderResolver,
    ServiceAndProviderService,
    ServiceProviderRepository,
    ServiceRepository,
    ServiceProvidedRepository,
    ServiceRequestedRepository,

    InvoiceRepository,
  ],
})
export class ServiceProviderModule {}
