import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ServiceProviderService } from '../services/service-provider.service';
import { ServiceProvider } from '../../entities/service-provider.entity';
import { CreateServiceProviderInput } from '../dto/create-service-provider.input';
import { UpdateServiceProviderInput } from '../dto/update-service-provider.input';

@Resolver(() => ServiceProvider)
export class ServiceProviderResolver {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) {}

  @Mutation(() => ServiceProvider)
  createServiceProvider(
    @Args('createServiceProviderInput')
    createServiceProviderInput: CreateServiceProviderInput,
  ) {
    return this.serviceProviderService.create(createServiceProviderInput);
  }

  @Query(() => [ServiceProvider], { name: 'serviceProvider' })
  findAll() {
    return this.serviceProviderService.findAll();
  }

  @Query(() => ServiceProvider, { name: 'serviceProvider' })
  findOne(@Args('id') id: string) {
    return this.serviceProviderService.findOne(id);
  }

  @Mutation(() => ServiceProvider)
  updateServiceProvider(
    @Args('updateServiceProviderInput')
    updateServiceProviderInput: UpdateServiceProviderInput,
  ) {
    return this.serviceProviderService.update(
      updateServiceProviderInput.id,
      updateServiceProviderInput,
    );
  }

  @Mutation(() => ServiceProvider)
  removeServiceProvider(@Args('id') id: string) {
    return this.serviceProviderService.remove(id);
  }
}
