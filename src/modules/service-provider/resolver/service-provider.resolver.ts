import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ServiceAndProviderService } from '../services/service-provider.service';
import { ServiceProvider } from '../../../entities/service-provider.entity';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  DeleteServiceProvider,
  ProvideNewService,
  ServiceProviderInput,
  UpdateServiceInput,
  UpdateServiceProviderInput,
} from '../dto/service';
import { PaginateAndSort } from '../../../modules/core/dto/pagination-and-sort.dto';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Service } from '../../../entities/services.entity';
import { ServiceStatus } from '../../../entities/provider-service-status.entity';

@Resolver(() => ServiceProvider)
export class ServiceAndProviderResolver {
  constructor(
    private readonly serviceProviderService: ServiceAndProviderService,
  ) {}
  @Mutation(() => ServiceProvider)
  async createServiceProvider(
    @Args('createServiceProviderInput')
    createServiceProviderInput: CreateServiceProviderInput,
  ) {
    return await this.serviceProviderService.createProvider(
      createServiceProviderInput,
    );
  }
  @Mutation(() => Service, { name: 'createService' })
  async createService(
    @Args('createServiceInput')
    createServiceInput: CreateServiceInput,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.createService(
      createServiceInput,
      ctx.req.user,
    );
  }

  @Query(() => [ServiceProvider], { name: 'findAllserviceProvider' })
  async findAll(@Args('paginateAndSort') paginateAndSort: PaginateAndSort) {
    return await this.serviceProviderService.findAllServiceProvider(
      paginateAndSort,
    );
  }

  @Query(() => ServiceProvider, { name: 'findAllserviceProviders' })
  async findOne(@Args('id') id: string) {
    return await this.serviceProviderService.findOneServiceProvider(id);
  }

  @Query(() => [Service], { name: 'findAllServices' })
  async findAllServices(
    @Args('paginateAndSort') paginateAndSort: PaginateAndSort,
  ) {
    return await this.serviceProviderService.findAllServices(paginateAndSort);
  }

  @Query(() => ServiceProvider, { name: 'findAllserviceProviders' })
  async findOneService(@Args('id') id: string) {
    return await this.serviceProviderService.findOneService(id);
  }

  @Mutation(() => ServiceProvider)
  async updateServiceProvider(
    @Args('updateServiceProviderInput')
    updateServiceProviderInput: UpdateServiceProviderInput,
  ) {
    return await this.serviceProviderService.updateProviderServiceCoverageArea(
      updateServiceProviderInput,
    );
  }

  @Mutation(() => SuccessResponse)
  async acceptServiceprovider(
    @Args('serviceProviderInput')
    serviceProviderInput: ServiceProviderInput,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.accept(
      serviceProviderInput,
      ctx.req.user,
    );
  }

  @Mutation(() => SuccessResponse)
  async rejectServiceprovider(
    @Args('serviceProviderInput')
    serviceProviderInput: ServiceProviderInput,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.reject(
      serviceProviderInput,
      ctx.req.user,
    );
  }

  @Mutation(() => SuccessResponse)
  async updateServiceStatus(
    @Args('updateServiceStatus')
    serviceProviderInput: UpdateServiceInput,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.updateServiceStatus(
      serviceProviderInput,
    );
  }

  @Mutation(() => SuccessResponse)
  async updateProviderServiceCoverageArea(
    @Args('updateProviderServiceCoverageArea')
    updateServiceInput: UpdateServiceProviderInput,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.updateProviderServiceCoverageArea(
      updateServiceInput,
    );
  }

  @Mutation(() => SuccessResponse)
  async acceptRequestAndStopRequest(
    @Args('updateServiceStatus')
    serviceProviderInput: UpdateServiceInput,
  ) {
    return await this.serviceProviderService.acceptRequestAndStopRequest(
      serviceProviderInput,
    );
  }

  @Mutation(() => ServiceStatus)
  async provideService(
    @Args('provideService')
    serviceProviderInput: ProvideNewService,
  ) {
    return await this.serviceProviderService.provideService(
      serviceProviderInput,
    );
  }

  @Mutation(() => ServiceProvider)
  async removeServiceProvider(
    @Args('deleteServiceProvider') deleteServiceProvider: DeleteServiceProvider,
  ) {
    return await this.serviceProviderService.delete(deleteServiceProvider);
  }
}
