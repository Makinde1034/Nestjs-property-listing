import { Module } from '@nestjs/common';
import { ServiceProviderService } from './services/service-provider.service';
import { ServiceProviderResolver } from './resolver/service-provider.resolver';
import { ServiceProviderRepository } from './repository/service-provider.repository';

@Module({
  providers: [
    ServiceProviderResolver,
    ServiceProviderService,
    ServiceProviderRepository,
  ],
})
export class ServiceProviderModule {}
