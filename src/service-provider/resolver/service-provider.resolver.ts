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
  findAll(@Args('paginateAndSort') paginateAndSort: PaginateAndSort) {
    return this.serviceProviderService.findAllServiceProvider(paginateAndSort);
  }

  @Query(() => ServiceProvider, { name: 'findAllserviceProviders' })
  findOne(@Args('id') id: string) {
    return this.serviceProviderService.findOneServiceProvider(id);
  }

  @Mutation(() => ServiceProvider)
  updateServiceProvider(
    @Args('updateServiceProviderInput')
    updateServiceProviderInput: UpdateServiceProviderInput,
  ) {
    return this.serviceProviderService.update(updateServiceProviderInput);
  }

  @Mutation(() => SuccessResponse)
  acceptServiceprovider(
    @Args('id')
    id: string,
    @Context() ctx: any,
  ) {
    return this.serviceProviderService.accept(id, ctx.req.user);
  }

  @Mutation(() => SuccessResponse)
  rejectServiceprovider(
    @Args('id')
    id: string,
    @Context() ctx: any,
  ) {
    return this.serviceProviderService.reject(id, ctx.req.user);
  }

  @Mutation(() => ServiceProvider)
  removeServiceProvider(
    @Args('deleteServiceProvider') deleteServiceProvider: DeleteServiceProvider,
  ) {
    return this.serviceProviderService.delete(deleteServiceProvider);
  }
}
