import { Module } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderResolver } from './service-provider.resolver';

@Module({
  providers: [ServiceProviderResolver, ServiceProviderService],
})
export class ServiceProviderModule {}
