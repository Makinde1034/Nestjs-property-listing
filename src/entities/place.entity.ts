import { Field, ObjectType } from '@nestjs/graphql';
import BaseEntity from './base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Listing } from './listing.entity';
@Entity()
@ObjectType()
export class Place extends BaseEntity {
  @Field()
  @Column()
  PlaceId: string;

  @Field()
  @Column()
  type: string;

  @Field(() => Listing)
  @ManyToOne(() => Listing, (listing) => listing.place)
  listing: Listing;
}
