/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Service } from '../../../entities/services.entity';
import { ServiceProvider } from '../../../entities/service-provider.entity';
import { ServiceProvided } from '../../../entities/service-provided.entity';
import { ServiceRequested } from '../../../entities/service-requested.entity';
@ObjectType()
export class ServiceResponse {
  @Field(() => [Service])
  service: Service[];

  @Field()
  count: number;
}
@ObjectType()
export class RequestedServiceResponse {
  @Field(() => [ServiceRequested], { nullable: true })
  request: ServiceRequested[];

  @Field()
  total: number;
}

@ObjectType()
export class ServiceProviderResponse {
  @Field(() => [ServiceProvider])
  serviceProvider: ServiceProvider[];

  @Field()
  count: number;
}

@ObjectType()
export class OneServiceProviderResponse {
  @Field()
  provider: ServiceProvider;

  @Field(() => [ServiceProvided])
  serviceProvided: ServiceProvided[];
}
