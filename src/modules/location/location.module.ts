/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CityRepository } from './repository';
import { LocationService } from './services';
import { LocationResolver } from './resolver';
import { CityEntitity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([CityEntitity])],
  providers: [LocationResolver, CityRepository, LocationService],
})
export class LocationModule {}
