import { Module } from '@nestjs/common';
import { ListingRepository } from '../listing/repositories/listing.repository';
import { UserRepository } from '../user/repositories';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing, User } from '../../entities';
import { OfferRepository } from '../listing/repositories';
import { Offer } from '../../entities/offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Listing, User])],
  providers: [OfferRepository, AdminService, ListingRepository, UserRepository],
})
export class AdminModule {}
