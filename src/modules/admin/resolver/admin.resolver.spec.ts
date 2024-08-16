/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { TestingModule, Test } from '@nestjs/testing';
import { AdminResolver } from './admin.resolver';
import { AdminService } from '../services/admin.service';
import { BadRequestException } from '@nestjs/common';

const mockAdminService = {
  listingStats: jest.fn((dto) => {
    if (dto.timePeriod != 'month') {
      throw new BadRequestException('invalid time period');
    }
    return {
      offer: 0,
      listing: 0,
      acceptedOffer: 0,
      OwnershipTransfer: 0,
    };
  }),
};

describe('AdminResolver', () => {
  let resolver: AdminResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminResolver, AdminService],
    })
      .overrideProvider(AdminService)
      .useValue(mockAdminService)
      .compile();

    resolver = module.get<AdminResolver>(AdminResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('it should get listingStats', async () => {
    await expect(
      resolver.listingStats({ timePeriod: 'month', value: 2 }),
    ).resolves.toEqual({
      offer: 0,
      listing: 0,
      acceptedOffer: 0,
      OwnershipTransfer: 0,
    });
    expect(mockAdminService.listingStats).toHaveBeenCalled();
  });

  it('it should return invalid time period for listingStats', async () =>
    await expect(
      resolver.listingStats({
        timePeriod: 'year',
        value: 4,
      }),
    ).rejects.toThrow(new BadRequestException('invalid time period')));
});
