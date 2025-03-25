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

@Processor('auction')
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
        case JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END:
        // const [auction, registration, participants] = await Promise.all([
        //   this.auctionRepository.findOneOrFail({
        //     where: { id: job.data.auctionId },
        //   }),
        //   //Bidders
        //   this.bidRegistrationRepository.find({
        //     where: { auctionId: job.data.auctionId },
        //   }),

        //   //Sellers
        //   this.auctionParticipantRepository
        //     .createQueryBuilder('auctionParticipant')
        //     .leftJoinAndSelect(
        //       'auctionParticipant.bid',
        //       'bids',
        //       'bids.price = (SELECT MAX(b.price) FROM Bids b WHERE b."auctionParticipantId" = auctionParticipant.id)',
        //     )
        //     .leftJoinAndSelect('auctionParticipant.listing', 'listing')
        //     .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
        //     .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
        //     .leftJoinAndSelect('listing.listingType', 'listingType')
        //     .leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate')
        //     .where('auctionParticipant.auctionId = :id', {
        //       id: job.data.auctionId,
        //     })
        //     .orderBy('bids.price', 'DESC')

        //     .getMany(),
        // ]);

        // // Remove duplicates from registeredId
        // const registeredUserIds = Array.from(
        //   new Set(
        //     registration.map((element) => {
        //       return {
        //         userId: element.userId,
        //       };
        //     }),
        //   ),
        // );

        // // Transform the data to include userId array within the participant object
        // const transformedParticipants = participants.map((participant) => ({
        //   ...participant,
        //   userId: participant.bid
        //     .map((bid) => bid.userId)
        //     .filter((userId) => userId), // Exclude null/undefined values
        // }));

        // this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
        //   creatorId: auction.auctionParticipant,
        //   receiverId: listing.user.id,
        //   scope: scope,
        //   event: 'Price change',
        //   recipientFormat: [null, 'User that has listing in wishlist'],
        //   img: auction.imageLink,
        //   metadata: JSON.stringify(auction),
        // });

        case JobEnum.AUCTION_WINNER:
          {
            console.log('processing auction winner');
            const [listing, bids, notificationPreference] = await Promise.all([
              this.listingRepository
                .createQueryBuilder('listing')

                .where('listing.id = :id', {
                  id: job.data.listingId,
                })
                .getOne(),

              this.bidRepository
                .createQueryBuilder('bids')
                .select('bids."listingId"', 'listingId')
                .addSelect('bids.userId', 'userId')
                .addSelect('bids.price', 'highestPrice')
                .where('bids.auctionId = :id', { id: job.data.auctionId })
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

            const images = JSON.parse(listing.images);
            bids.forEach(async (element) => {
              this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
                receiverId: element.userId,
                scope: scope,
                event: 'Winner Result',
                recipientFormat: [null, 'Bidder'],
                img: images[0]?.url,
                metadata: JSON.stringify(listing),
              });
            });
          }
          break;

        case JobEnum.AUCTION_LOOSER:
          {
            const [auction, bids] = await Promise.all([
              this.auctionRepository
                .createQueryBuilder('auction')
                .leftJoinAndSelect(
                  'auction.auctionParticipant',
                  'auctionParticipant',
                )

                .where('auction.id = :id', { id: job.data.id })
                .getOne(),

              this.bidRepository
                .createQueryBuilder('bids')
                .select('bids.listingId', 'listingId')

                .addSelect('MAX(bids.price)', 'highestPrice')
                // Get max price
                .where('bids.auctionId = :id', { id: job.data.id })
                .groupBy('bids.listingId')
                .getRawMany(),

              this.bidRepository
                .createQueryBuilder('bids')
                .select('bids.listingId', 'listingId')

                .addSelect('MAX(bids.price)', 'highestPrice')
                // Get max price
                .where('bids.auctionId = :id', { id: job.data.id })
                .groupBy('bids.listingId')
                .getRawMany(),
            ]);

            bids.forEach(async (element) => {
              await this.auctionParticipantRepository.findOneOrFail({
                where: { listingId: element.listingId },
              });

              const registered = await this.bidRegistrationRepository.find({
                where: { auctionId: job.data.auctionId },
              });
            });

            auction.auctionParticipant.forEach((element) => {});

            // this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
            //   creatorId: element.userId,
            //   receiverId: auction.auctionParticipant,
            //   scope: scope,
            //   event: 'Price change',
            //   recipientFormat: [null, 'User that has listing in wishlist'],
            //   img: auction.imageLink,
            //   metadata: JSON.stringify(auction),
            // });

            console.log('here', bids);
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
}
