/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

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
  RequestedServiceResponse,
  ServiceProviderResponse,
  ServiceResponse,
} from '../dto/service.response';
import { ServiceRequested } from '../../../entities/service-requested.entity';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { ServiceProviderGuard } from '../../auth/guards/service-provider.guard';
import { Permissions } from '../../../common/decorator/permission';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
import { AdminFilterAndSort } from '../../listing/dtos/request';

@Resolver(() => ServiceProvider)
export class ServiceAndProviderResolver {
  constructor(
    private readonly serviceProviderService: ServiceAndProviderService,
  ) {}

  @UseGuards(AccessTokenGuard)
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

  @UseGuards(AccessTokenGuard)
  @UseGuards(ServiceProviderGuard)
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
  @UseGuards(AccessTokenGuard)
  @Query(() => ServiceProviderResponse, { name: 'findAllServiceProviders' })
  async findAll(@Args('paginateAndSort') paginateAndSort: AdminFilterAndSort) {
    return await this.serviceProviderService.findAllServiceProvider(
      paginateAndSort,
    );
  }
  @UseGuards(AccessTokenGuard)
  @Query(() => OneServiceProviderResponse, { name: 'findOneServiceProvider' })
  async findOne(@Args('id') id: string): Promise<OneServiceProviderResponse> {
    return await this.serviceProviderService.findOneServiceProvider(id);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => ServiceProvider, { name: 'checkServiceProviderstatus' })
  async checkServiceProviderstatus(
    @Context() ctx: any,
  ): Promise<ServiceProvider> {
    return await this.serviceProviderService.serviceProviderStatus(
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => ServiceResponse, { name: 'findAllService' })
  async findAllServices(
    @Args('paginateAndSort') paginateAndSort: PaginateAndSort,
  ) {
    return await this.serviceProviderService.findAllServices(paginateAndSort);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => ServiceProvider, { name: 'findOneService' })
  async findOneService(@Args('id') id: string) {
    return await this.serviceProviderService.findOneService(id);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => ServiceProvider)
  async updateServiceProvider(
    @Args('updateServiceProviderInput')
    updateServiceProviderInput: UpdateServiceProviderInput,
  ) {
    return await this.serviceProviderService.updateProviderServiceCoverageArea(
      updateServiceProviderInput,
    );
  }

  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
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

  @UseGuards(AccessTokenGuard)
  @UseGuards(ServiceProviderGuard)
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
  @UseGuards(AccessTokenGuard)
  @UseGuards(ServiceProviderGuard)
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

  @UseGuards(AccessTokenGuard, ServiceProviderGuard)
  @Mutation(() => SuccessResponse)
  async acceptRequestAndStopRequest(
    @Args('updateServiceStatus')
    serviceProviderInput: UpdateServiceInput,
  ) {
    return await this.serviceProviderService.acceptRequestAndStopRequest(
      serviceProviderInput,
    );
  }

  @UseGuards(AccessTokenGuard, ServiceProviderGuard)
  @Mutation(() => ServiceProvided)
  async provideService(
    @Args('provideService')
    serviceProviderInput: ProvideNewService,
  ) {
    return await this.serviceProviderService.provideService(
      serviceProviderInput,
    );
  }
  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse)
  async cancleService(@Args('id') id: string, @Context() ctx: any) {
    return await this.serviceProviderService.cancleService(id, ctx.req.user);
  }
  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse)
  async appealService(@Args('id') id: string, @Context() ctx: any) {
    return await this.serviceProviderService.appealService(id, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => SuccessResponse)
  async confirmService(@Args('id') id: string, @Context() ctx: any) {
    return await this.serviceProviderService.confirmService(id, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.SERVICES_STATUS_DEACTIVATE_REACTIVATE)
  @Mutation(() => SuccessResponse)
  async acceptService(@Args('id') id: string, @Context() ctx: any) {
    return await this.serviceProviderService.acceptService(id, ctx.req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.SERVICES_STATUS_DEACTIVATE_REACTIVATE)
  @Mutation(() => SuccessResponse)
  async rejectService(@Args('id') id: string, @Context() ctx: any) {
    return await this.serviceProviderService.rejectService(id, ctx.req.user);
  }
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.SERVICES_STATUS_DEACTIVATE_REACTIVATE)
  @Mutation(() => SuccessResponse)
  async removeServiceProvider(
    @Args('deleteServiceProvider') deleteServiceProvider: DeleteServiceProvider,
  ) {
    return await this.serviceProviderService.delete(deleteServiceProvider);
  }

  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
  @Query(() => RequestedServiceResponse, { name: 'ViewServiceRequest' })
  async ViewServiceRequest(
    @Args('paginateAndSort') paginateAndSort: PaginateAndSort,
    @Context() ctx: any,
  ): Promise<RequestedServiceResponse> {
    return await this.serviceProviderService.ViewServiceRequest(
      paginateAndSort,
      ctx.req.user,
    );
  }
  @UseGuards(AccessTokenGuard)
  @UseGuards(ServiceProviderGuard)
  @Query(() => RequestedServiceResponse, { name: 'ViewServiceRequested' })
  async ViewServiceRequested(
    @Args('paginateAndSort') paginateAndSort: PaginateAndSort,
    @Context() ctx: any,
  ): Promise<RequestedServiceResponse> {
    return await this.serviceProviderService.ViewServiceRequested(
      paginateAndSort,
      ctx.req.user,
    );
  }
}
