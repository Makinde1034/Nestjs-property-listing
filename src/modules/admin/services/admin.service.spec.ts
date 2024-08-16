/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { ListingRepository } from '../../listing/repositories/listing.repository';
import { OfferRepository } from '../../listing/repositories';
import { UserRepository } from '../../user/repositories';
import { UserTrackingRepository } from '../../user/repositories/user-tracking-repository';
import { IssueRepository } from '../../issue/repositories';
import { TicketRepository } from '../../tickets/repositories';

//TODO move to global mock file

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([]),
  andWhere: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
};

describe('AdminService', () => {
  let service: AdminService;
  let listingRepository: Partial<jest.Mocked<ListingRepository>>;
  let offerRepository: Partial<jest.Mocked<OfferRepository>>;
  let userRepository: Partial<jest.Mocked<UserRepository>>;
  let userTrackingRepository: Partial<jest.Mocked<UserTrackingRepository>>;
  let issueRepository: Partial<jest.Mocked<IssueRepository>>;
  let ticketRepository: Partial<jest.Mocked<TicketRepository>>;
});

// Describe('AdminService', () => ?
// Let service: AdminService;
// Let listingRepository: Partial<ListingRepository>;
// Let issueRepository: Partial<IssueRepository>;
// Let ticketRepository: Partial<TicketRepository>;

// BeforeEach(async () => {
//     Const module: TestingModule = await Test.createTestingModule({
//         Providers: [
//             AdminService,
//             {
//                 Provide: getRepositoryToken(ListingRepository),
//                 UseValue: {
//                     CreateQueryBuilder: jest.fn(() => mockQueryBuilder),
//                 },
//             },
//             {
//                 Provide: getRepositoryToken(OfferRepository),
//                 UseValue: {
//                     CreateQueryBuilder: jest.fn(() => mockQueryBuilder),
//                 },
//             },
//             {
//                 Provide: getRepositoryToken(UserRepository),
//                 UseValue: {
//                     CreateQueryBuilder: jest.fn(() => mockQueryBuilder),
//                 },
//             },
//             {
//                 Provide: getRepositoryToken(IssueRepository),
//                 UseValue: {
//                     CreateQueryBuilder: jest.fn(() => mockQueryBuilder),
//                 },
//             },
//             {
//                 Provide: getRepositoryToken(TicketRepository),
//                 UseValue: {},
//             },
//         ],
//     }).compile();

//     Service = module.get<AdminService>(AdminService);
//     ListingRepository = module.get<ListingRepository>(ListingRepository);

//     IssueRepository = module.get<IssueRepository>(IssueRepository);
//     //   ticketRepository = module.get<TicketRepository>(TicketRepository);
// });

// Describe('averageSupportTime', () => {
// It('should return average support time', async () => {
//     IssueRepository.createQueryBuilder.mockReturnValueOnce({
//         Select: jest.fn().mockReturnThis(),
//         Where: jest.fn().mockReturnThis(),
//         GetRawOne: jest
//             .fn()
//             .mockResolvedValueOnce({ avgTimeDifference: '3600' }),
//     });

//     Const result = await service.averageSupportTime();
//     Expect(result).toBe(3600);
// });

// It('should return 0 if avgTimeDifference is NaN', async () => {
//     IssueRepository.createQueryBuilder.mockReturnValueOnce({
//         Select: jest.fn().mockReturnThis(),
//         Where: jest.fn().mockReturnThis(),
//         GetRawOne: jest
//             .fn()
//             .mockResolvedValueOnce({ avgTimeDifference: null }),
//     });

//         Const result = await service.averageSupportTime();
//         Expect(result).toBe(0);
//     });
// });

//     Describe('listingStats', () => {
//         It('should return listing stats', async () => {
//             Const mockStats = [100, 50, 20, 30];
//             ListingRepository.count.mockResolvedValueOnce(mockStats[0]);
//             OfferRepository.count.mockResolvedValueOnce(mockStats[1]);
//             OfferRepository.count.mockResolvedValueOnce(mockStats[2]);
//             ListingRepository.count.mockResolvedValueOnce(mockStats[3]);

//             // const result = await service.listingStats();
//             Expect(result).toEqual({
//                 Listing: 100,
//                 Offer: 50,
//                 AcceptedOffer: 20,
//                 OwnershipTransfer: 30,
//             });
//         });
//     });

// })
