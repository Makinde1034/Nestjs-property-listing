/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ListingTypeResolver } from './listing-type.resolver';

describe('ListingTypeResolver', () => {
  let resolver: ListingTypeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingTypeResolver],
    }).compile();

    resolver = module.get<ListingTypeResolver>(ListingTypeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
