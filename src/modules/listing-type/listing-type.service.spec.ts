/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ListingTypeService } from './listing-type.service';

describe('ListingTypeService', () => {
  let service: ListingTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingTypeService],
    }).compile();

    service = module.get<ListingTypeService>(ListingTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
