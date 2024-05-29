/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { CityRepository } from '../repository';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { FindOptionsOrder } from 'typeorm';

@Injectable()
export class LocationService {
  constructor(private cityRepository: CityRepository) {}

  async findCities(data: PaginateAndSort) {
    const order: FindOptionsOrder<any> = {};
    if (data.direction_to_sort) {
      order[data.sortField] = data.direction_to_sort;
    }
    return await this.cityRepository.findAndCount({
      where: {},
      take: data.take,
      skip: data.skip,
      order: order,
    });
  }
}
