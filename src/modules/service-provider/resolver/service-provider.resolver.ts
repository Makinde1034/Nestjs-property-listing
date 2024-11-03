import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ServiceAndProviderService } from '../services/service-provider.service';
import { ServiceProvider } from '../../../entities/service-provider.entity';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  DeleteServiceProvider,
  ServiceProviderInput,
  UpdateServiceProviderInput,
} from '../dto/service';
import { PaginateAndSort } from '../../../modules/core/dto/pagination-and-sort.dto';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Service } from '../../../entities/services.entity';

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

  async createService(
    @Args('createServiceProviderInput')
    createServiceInput: CreateServiceInput,
  ) {
    return await this.serviceProviderService.createService(createServiceInput);
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

  @Mutation(() => ServiceProvider)
  async removeServiceProvider(
    @Args('deleteServiceProvider') deleteServiceProvider: DeleteServiceProvider,
  ) {
    return await this.serviceProviderService.delete(deleteServiceProvider);
  }
}
