/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { ListingRepository } from '../../listing/repositories/listing.repository';
import { OfferRepository } from '../../listing/repositories/offer.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { UserTrackingRepository } from '../../user/repositories/user-tracking-repository';
import { IssueRepository } from '../../issue/repositories';
import { TicketRepository } from '../../tickets/repositories';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRepository } from '../repositories/admin.repository';
import { CouponRepository } from '../repositories/coupons.repository';
import { CreateCouponInput } from '../dto/request/coupons';
import { CouponEnum } from '../../../common/enums/coupons.enum';
import { AdminDefault } from '../../../entities/admin-table.entity';

// Mock QueryBuilder
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([]), // Mock return data for query
  getRawOne: jest.fn().mockResolvedValue({ avgTimeDifference: 12345 }), // Simulate a query result
};

// Global mock repository setup
const mockRepository = {
  create: jest.fn().mockReturnThis(),
  count: jest.fn().mockReturnThis(),
  save: jest.fn().mockReturnThis(),
  findOneBy: jest.fn().mockReturnThis(),
  find: jest.fn().mockResolvedValue([]),
  createQueryBuilder: jest.fn(() => mockQueryBuilder), // Return the mocked query builder
};

describe('AdminService', () => {
  let adminService: AdminService;
  let listingRepository: Repository<any>;
  let offerRepository: Repository<any>;
  let adminDefaultRepository: Repository<any>;
  let couponRepository: Repository<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,

        {
          provide: getRepositoryToken(CouponRepository),
          useValue: mockRepository,
        },

        {
          provide: getRepositoryToken(AdminRepository),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ListingRepository),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(OfferRepository),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(UserTrackingRepository),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(IssueRepository),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(TicketRepository),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);

    listingRepository = module.get<Repository<any>>(
      getRepositoryToken(ListingRepository),
    );
    offerRepository = module.get<Repository<any>>(
      getRepositoryToken(OfferRepository),
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adminDefaultRepository = module.get<Repository<any>>(
      getRepositoryToken(AdminRepository),
    );

    couponRepository = module.get<Repository<any>>(
      getRepositoryToken(CouponRepository),
    );
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
  });

  it('should return within acceptable time limits', async () => {
    const start = Date.now();
    await adminService.responseTime();
    const end = Date.now();
    const duration = end - start;

    // Assuming the method should not take more than 200ms
    expect(duration).toBeLessThan(200);
  });

  it('should return the correct average close and support times', async () => {
    const mockAverageCloseTime = 100;
    const mockAverageSupportTime = 200;

    jest
      .spyOn(adminService, 'averageCloseTime')
      .mockResolvedValue(mockAverageCloseTime);
    jest
      .spyOn(adminService, 'averageSupportTime')
      .mockResolvedValue(mockAverageSupportTime);

    // Call the responseTime method
    const result = await adminService.responseTime();

    // Assert the result
    expect(result).toEqual({
      averageCloseTime: mockAverageCloseTime,
      averageSupportTime: mockAverageSupportTime,
    });

    // Verify that the methods were called
    expect(adminService.averageCloseTime).toHaveBeenCalled();
    expect(adminService.averageSupportTime).toHaveBeenCalled();
  });

  it('should mock coupon repository', async () => {
    const mockCreateCoupon: CreateCouponInput = {
      maxUse: 1,
      discountType: CouponEnum.NUMBER,
      discountValue: 20,
      endDate: new Date(),
      startDate: new Date(),
    };

    jest.spyOn(couponRepository, 'create').mockReturnValue(mockCreateCoupon);
    jest
      .spyOn(couponRepository, 'save')
      .mockResolvedValueOnce(mockCreateCoupon);

    // Call the createCoupon method
    const result = await adminService.createCoupon(mockCreateCoupon);

    // Assert that the result matches the mockCreateCoupon
    expect(result).toEqual(mockCreateCoupon);
  });

  it('should mock admin default repository', async () => {
    const adminDefault: Partial<AdminDefault> = {
      minimumOfferPercentage: 80,
      street: '2 fake street',
      city: 'cario',
      state: 'cario',
      country: 'Egypt',
      countryISOCode: 'SAR',
      paymentType: 'DB',
      saii: 2.5,
      vat: 15,
      daysToAuctionRegistrationStart: 7,
      daysToAuctionRegistrationEnd: 7,
      postcode: '4240111',
      merchantTransactionId: 'WASEET-2024-PI',
    };

    jest.spyOn(adminDefaultRepository, 'create').mockReturnValue(adminDefault);
    jest
      .spyOn(adminDefaultRepository, 'save')
      .mockResolvedValueOnce(adminDefault);

    // Call the createCoupon method
    const result = await adminDefaultRepository.save(adminDefault);

    // Assert that the result matches the mockCreateCoupon
    expect(result).toEqual(adminDefault);
  });

  it('should fetch listing stats', async () => {
    // Call the method

    // Mock the count methods
    jest.spyOn(offerRepository, 'count').mockResolvedValueOnce(5); // Example count value for offers
    jest.spyOn(listingRepository, 'count').mockResolvedValueOnce(10); // Example count value for listings

    // Mock the values for acceptedOffer and ownershipTransfer
    jest.spyOn(offerRepository, 'count').mockResolvedValueOnce(2); // Example count value for accepted offers
    jest.spyOn(listingRepository, 'count').mockResolvedValueOnce(8); // Example count value for ownership transfers

    const result = await adminService.listingStats({
      timePeriod: 'month',
      value: 4,
    });

    const expected = {
      offer: 5,
      listing: 10,
      acceptedOffer: 2,
      ownershipTransfer: 8,
    };

    // Assert the query builder calls
    expect(result).toEqual(expected);
  });
});
