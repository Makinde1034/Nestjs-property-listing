import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ServiceAndProviderService } from '../services/service-provider.service';
import { ServiceProvider } from '../../entities/service-provider.entity';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  DeleteServiceProvider,
  UpdateServiceProviderInput,
} from '../dto/service';
import { PaginateAndSort } from '../../modules/core/dto/pagination-and-sort.dto';
import { SuccessResponse } from '../../common/utils/success.response';

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

  @Query(() => [ServiceProvider], { name: 'findAllservices' })
  async findAll(@Args('paginateAndSort') paginateAndSort: PaginateAndSort) {
    return await this.serviceProviderService.findAllServiceProvider(
      paginateAndSort,
    );
  }

  @Query(() => ServiceProvider, { name: 'findAllserviceProviders' })
  async findOne(@Args('id') id: string) {
    return await this.serviceProviderService.findOneServiceProvider(id);
  }

  @Mutation(() => ServiceProvider)
  async updateServiceProvider(
    @Args('updateServiceProviderInput')
    updateServiceProviderInput: UpdateServiceProviderInput,
  ) {
    return await this.serviceProviderService.update(updateServiceProviderInput);
  }

  @Mutation(() => SuccessResponse)
  async acceptServiceprovider(
    @Args('id')
    id: string,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.accept(id, ctx.req.user);
  }

  @Mutation(() => SuccessResponse)
  async rejectServiceprovider(
    @Args('id')
    id: string,
    @Context() ctx: any,
  ) {
    return await this.serviceProviderService.reject(id, ctx.req.user);
  }

  @Mutation(() => ServiceProvider)
  async removeServiceProvider(
    @Args('deleteServiceProvider') deleteServiceProvider: DeleteServiceProvider,
  ) {
    return await this.serviceProviderService.delete(deleteServiceProvider);
  }
}
