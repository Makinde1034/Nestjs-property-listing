import { Module } from '@nestjs/common';
import { ServiceAndProviderService } from './services/service-provider.service';
import { ServiceAndProviderResolver } from './resolver/service-provider.resolver';
import { ServiceProviderRepository } from './repository/service-provider.repository';
import { ServiceRepository } from './repository/services.repository';

import { ServiceStatusRepository } from './repository/service-status.repository';

@Module({
  providers: [
    ServiceAndProviderResolver,
    ServiceAndProviderService,
    ServiceProviderRepository,
    ServiceRepository,
    ServiceStatusRepository,
  ],
})
export class ServiceProviderModule {}
