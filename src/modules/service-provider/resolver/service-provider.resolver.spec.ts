/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProviderResolver } from './service-provider.resolver';
import { ServiceProviderService } from '../services/service-provider.service';

describe('ServiceProviderResolver', () => {
  let resolver: ServiceProviderResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceProviderResolver, ServiceProviderService],
    }).compile();

    resolver = module.get<ServiceProviderResolver>(ServiceProviderResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
