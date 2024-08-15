/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Listing } from './listing.entity';

@Entity()
@ObjectType()
export class GpsCoordinate extends BaseEntity {
  @Column('double precision')
  @Field()
  lat: number;

  @Column('double precision')
  @Field()
  lng: number;

  @Field(() => GpsCoordinate)
  @JoinColumn({ name: 'listingId' })
  @OneToOne(() => Listing, (listing) => listing.gpsCoordinate)
  listing: Listing;
}
