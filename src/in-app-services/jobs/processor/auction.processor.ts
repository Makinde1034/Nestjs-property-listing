import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuctionRepository } from '../../../modules/listing/repositories/auction.repository';
import { JobEnum } from '../../../common/enums/jobs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../../../common/enums';
import { BidRegistrationRepository } from '../../../modules/listing/repositories/bid-registration.repository';
import { AuctionParticipantRepository } from '../../../modules/listing/repositories/auction-participant.repository';
import { BidsRepository } from '../../../modules/listing/repositories/bids.repository';
import { ListingRepository } from '../../../modules/listing/repositories/listing.repository';
import { NotificationScopeRepository } from '../../../modules/user/repositories';
import { NotificationScope } from '../../../entities';
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';
import { In, Not } from 'typeorm';
import { PaginateAndSort } from '../../../modules/core/dto/pagination-and-sort.dto';

// @Processor('auction')
export class AuctionProcessor extends WorkerHost {
  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly bidRegistrationRepository: BidRegistrationRepository,
    private readonly auctionParticipantRepository: AuctionParticipantRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly bidRepository: BidsRepository,
    private readonly listingRepository: ListingRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
  ) {
    super();
  }
  async process(job: Job) {
    try {
      switch (job.name) {
        case JobEnum.LAST_MINUTES: {
          const [auction, registration] = await Promise.all([
            this.auctionRepository.findOneOrFail({
              where: { id: job.data.id },
            }),

            //Bidders
            this.bidRegistrationRepository.find({
              where: { listingId: job.data.listingId },
            }),
          ]);

          const notificationPreference =
            await this.notificationScopeRepository.find();

          const scope: NotificationScope = notificationPreference.find(
            (element) =>
              element.scopeGroup === NotificationScopeEnum.LIVE_AUCTION,
          );

          const listing = await this.listingRepository.findOneOrFail({
            where: { id: job.data.listingId },
            relations: ['user'],
          });
          this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
            creatorId: listing.userId,
            scope: scope,
            event: 'Last minute',
            recipientFormat: ['Listing Bidder and Seller', null],
            img: auction.imageLink,
            metadata: JSON.stringify(auction),
          });

          registration.forEach(async (element) => {
            this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
              receiverId: element.userId,
              scope: scope,
              event: 'Last minute',
              recipientFormat: [
                'Listing Bidder and Seller',
                'Listing Bidder and Seller',
              ],
              img: auction.imageLink,
              metadata: JSON.stringify(auction),
            });
          });
        }
        case JobEnum.NEW_BID:
          {
            const [auction, bid] = await Promise.all([
              this.auctionRepository.findOneOrFail({
                where: { id: job.data.id },
              }),

              //Bidders
              this.bidRepository.findOne({
                where: { listingId: job.data.listingId },
              }),
            ]);

            const notificationPreference =
              await this.notificationScopeRepository.find();

            const scope: NotificationScope = notificationPreference.find(
              (element) =>
                element.scopeGroup === NotificationScopeEnum.LIVE_AUCTION,
            );

            const listing = await this.listingRepository.findOneOrFail({
              where: { id: job.data.listingId },
            });

            this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
              creatorId: listing.userId,
              receiverId: bid.userId,

              scope: scope,
              event: 'Bids',
              recipientFormat: [
                'Listing Bidder and Seller',
                'Listing Bidder and Seller',
              ],
              img: auction.imageLink,
              metadata: JSON.stringify(auction),
            });
          }

          break;

        case JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END:
          {
            const [auction, registration] = await Promise.all([
              this.auctionRepository.findOneOrFail({
                where: { id: job.data.id },
              }),

              //Bidders
              this.bidRegistrationRepository.find({
                where: { listingId: job.data.listingId },
              }),
            ]);

            const notificationPreference =
              await this.notificationScopeRepository.find();

            const scope: NotificationScope = notificationPreference.find(
              (element) =>
                element.scopeGroup === NotificationScopeEnum.LIVE_AUCTION,
            );

            const listing = await this.listingRepository.findOneOrFail({
              where: { id: job.data.listingId },
              relations: ['user'],
            });
            this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
              creatorId: listing.userId,
              scope: scope,
              event: '15 minutes to end',
              recipientFormat: ['Listing Bidder and Seller', null],
              img: auction.imageLink,
              metadata: JSON.stringify(auction),
            });

            registration.forEach(async (element) => {
              this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
                receiverId: element.userId,
                scope: scope,
                event: '15 minutes to end',
                recipientFormat: [
                  'Listing Bidder and Seller',
                  'Listing Bidder and Seller',
                ],
                img: auction.imageLink,
                metadata: JSON.stringify(auction),
              });
            });
          }

          break;

        case JobEnum.AUCTION_WINNER:
          {
            console.log('processing auction winner');
            const [auction, bids, notificationPreference] = await Promise.all([
              this.auctionRepository.findOneOrFail({
                where: { id: job.data.id },
              }),
              this.bidRepository
                .createQueryBuilder('bids')
                .select('bids."listingId"', 'listingId')
                .addSelect('bids.userId', 'userId')
                .addSelect('bids.price', 'highestPrice')
                .where('bids.auctionId = :id', { id: job.data.id })
                .andWhere(
                  'bids.price = (SELECT MAX(sub_bids.price) FROM bids sub_bids WHERE sub_bids."listingId" = bids."listingId")',
                )
                .getRawMany(),

              this.notificationScopeRepository.find(),
              //Filter out the correct scope
            ]);

            const scope: NotificationScope = notificationPreference.find(
              (element) => {
                if (element.scopeGroup == NotificationScopeEnum.LIVE_AUCTION) {
                  return element;
                }
              },
            );

            bids.forEach(async (element) => {
              const listing = await this.listingRepository.findOneOrFail({
                where: { id: element.listingId },
                relations: ['user'],
              });
              this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
                receiverId: element.userId,
                scope: scope,
                event: 'Winner Result',
                recipientFormat: [null, 'Bidder'],
                img: auction.imageLink,
                metadata: JSON.stringify(listing),
              });
            });
          }
          break;

        case JobEnum.AUCTION_LOOSER:
          {
            console.log('processing auction looser');

            let bidIds: number[] = [];

            const [auction, winners, notificationPreference] =
              await Promise.all([
                this.auctionRepository.findOneOrFail({
                  where: { id: job.data.id },
                }),
                this.bidRepository
                  .createQueryBuilder('bids')
                  .select('bids."listingId"', 'listingId')
                  .addSelect('bids.userId', 'userId')
                  .addSelect('bids.id', 'bidId')
                  .addSelect('bids.price', 'highestPrice')
                  .where('bids.auctionId = :id', { id: job.data.id })
                  .andWhere(
                    'bids.price = (SELECT MAX(sub_bids.price) FROM bids sub_bids WHERE sub_bids."listingId" = bids."listingId")',
                  )
                  .getRawMany(),

                this.notificationScopeRepository.find(),
              ]);

            // Store winning bid IDs
            bidIds = winners.map((element) => element.bidId);

            // Fetch losing bids in one query
            const losingBids = await this.bidRepository
              .createQueryBuilder('bids')
              .select('DISTINCT ON (bids.userId, bids.listingId) bids.*') // Ensure uniqueness
              .where('bids.id NOT IN (:...bidIds)', { bidIds })
              .orderBy('bids.userId, bids.listingId, bids.createdAt', 'DESC') // Get latest bid per user/listing
              .getRawMany();

            // Find notification scope
            const scope: NotificationScope = notificationPreference.find(
              (element) =>
                element.scopeGroup === NotificationScopeEnum.LIVE_AUCTION,
            );

            // Process notifications in bulk using Promise.all
            await Promise.all(
              losingBids.map(async (element) => {
                const listing = await this.listingRepository.findOneOrFail({
                  where: { id: element.listingId },
                  relations: ['user'],
                });

                this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
                  receiverId: element.userId,
                  scope: scope,
                  event: 'Looser Result',
                  recipientFormat: [null, 'Bidder'],
                  img: auction.imageLink,
                  metadata: JSON.stringify(listing),
                });
              }),
            );
          }
          break;
        case JobEnum.NO_BID:
          {
            console.log('processing auction bid');

            let bidIds: number[] = [];

            const bids = await this.bidRepository
              .createQueryBuilder('bids')
              .select('bids."listingId"', 'listingId')

              .where('bids.listingId = :id', { id: job.data.id })

              .getCount();

            if (bids == 0) {
              const notificationPreference =
                await this.notificationScopeRepository.find();

              // Find notification scope
              const scope: NotificationScope = notificationPreference.find(
                (element) =>
                  element.scopeGroup === NotificationScopeEnum.LIVE_AUCTION,
              );

              // Process notifications in bulk using Promise.all
              const listing = await this.listingRepository.findOneOrFail({
                where: { id: job.data.id },
                relations: ['user'],
              });

              this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
                receiverId: listing.userId,
                scope: scope,
                event: 'No Bid Result',
                recipientFormat: [null, 'Bidder'],
                img: '',
                metadata: JSON.stringify(listing),
              });
            }
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findLoosingBids(data: Partial<PaginateAndSort>, bidId: string[]) {
    return await this.bidRepository.findAndCount({
      where: { price: Not(In(bidId)) },
      skip: data.skip,
      take: data.take,
    });
  }
}
