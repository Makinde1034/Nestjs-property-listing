import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Auction } from './auction-table.entity';
import BaseEntity from './base.entity';

@Entity()
@ObjectType()
export class AuctionParticipant extends BaseEntity {
  @Field()
  @Column()
  listingId: string;

  @Field(() => Auction)
  @ManyToOne(() => Auction, (auction) => auction.auctionParticipant)
  auction: Auction;
}
