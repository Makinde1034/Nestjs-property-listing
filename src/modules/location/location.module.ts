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
import { UserRepository } from '../user/repositories';
@Module({
  imports: [TypeOrmModule.forFeature([CityEntitity])],
  providers: [
    LocationResolver,
    CityRepository,
    LocationService,
    UserRepository,
  ],
  exports: [LocationResolver, CityRepository, LocationService, UserRepository],
})
export class LocationModule {}
