import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ServiceAndProviderService } from '../services/service-provider.service';
import { ServiceProvider } from '../../../entities/service-provider.entity';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  DeleteServiceProvider,
  ProvideNewService,
  RequestForService,
  ServiceProviderInput,
  UpdateServiceInput,
  UpdateServiceProviderInput,
} from '../dto/service';
import { PaginateAndSort } from '../../../modules/core/dto/pagination-and-sort.dto';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Service } from '../../../entities/services.entity';
import { ServiceProvided } from '../../../entities/service-provided.entity';
import {
  OneServiceProviderResponse,
  ServiceProviderResponse,
  ServiceResponse,
} from '../dto/service.response';
import { ServiceRequested } from '../../../entities/service-requested.entity';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';

@Resolver(() => ServiceProvider)
export class ServiceAndProviderResolver {
  constructor(
    private readonly serviceProviderService: ServiceAndProviderService,
  ) {}
  @Mutation(() => ServiceProvider)
  async createServiceProvider(
    @Args('createServiceProviderInput')
    createServiceProviderInput: CreateServiceProviderInput,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.createProvider(
      createServiceProviderInput,
      ctx.req.user,
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

  @Query(() => ServiceProviderResponse, { name: 'findAllServiceProviders' })
  async findAll(@Args('paginateAndSort') paginateAndSort: PaginateAndSort) {
    return await this.serviceProviderService.findAllServiceProvider(
      paginateAndSort,
    );
  }

  @Query(() => OneServiceProviderResponse, { name: 'findOneServiceProvider' })
  async findOne(@Args('id') id: string): Promise<OneServiceProviderResponse> {
    return await this.serviceProviderService.findOneServiceProvider(id);
  }

  @Query(() => ServiceResponse, { name: 'findAllService' })
  async findAllServices(
    @Args('paginateAndSort') paginateAndSort: PaginateAndSort,
  ) {
    return await this.serviceProviderService.findAllServices(paginateAndSort);
  }

  @Query(() => ServiceProvider, { name: 'findOneService' })
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
  async acceptServiceProvider(
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
  async rejectServiceProvider(
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

  @Mutation(() => ServiceProvided)
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

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => ServiceRequested)
  async requestForService(
    @Args('requestForService') requestForService: RequestForService,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.requestForService(
      requestForService,
      ctx.req.user,
    );
  }
}
