import { Field, ObjectType } from '@nestjs/graphql';
import { Service } from '../../../entities/services.entity';
import { ServiceProvider } from '../../../entities/service-provider.entity';
@ObjectType()
export class ServiceResponse {
  @Field(() => [Service])
  service: Service[];

  @Field()
  count: number;
}

@ObjectType()
export class ServiceProviderResponse {
  @Field(() => [ServiceProvider])
  serviceProvider: ServiceProvider[];

  @Field()
  count: number;
}
