/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProviderService } from './service-provider.service';

describe('ServiceProviderService', () => {
  let service: ServiceProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceProviderService],
    }).compile();

    service = module.get<ServiceProviderService>(ServiceProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
