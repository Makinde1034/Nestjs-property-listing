/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Query, Resolver } from '@nestjs/graphql';

import { LocationService } from '../services';

import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { CityResponse } from '../dto/response/city.response';

@Resolver()
export class LocationResolver {
  constructor(private locationService: LocationService) {}

  @Query(() => CityResponse, { name: 'findCities' })
  async findCities(
    @Args('findCities', { nullable: true }) paginateAndSort: PaginateAndSort,
  ) {
    const [city, total] =
      await this.locationService.findCities(paginateAndSort);
    return { city, total };
  }
}
