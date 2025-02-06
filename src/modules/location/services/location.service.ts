/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import * as maxmind from 'maxmind';
import { CityRepository } from '../repository';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { FindOptionsOrder } from 'typeorm';
import { UserRepository } from '../../user/repositories';

@Injectable()
export class LocationService {
  private db: maxmind.Reader<any>;

  constructor(
    private cityRepository: CityRepository,
    private userRepository: UserRepository,
  ) {
    maxmind.open('./src/data/GeoLite2-City.mmdb').then((reader) => {
      this.db = reader;
    });
  }

  logger = new Logger(LocationService.name);

  async findCities(data: PaginateAndSort) {
    const order: FindOptionsOrder<any> = {};
    if (data.directionToSort) {
      order[data.sortField] = data.directionToSort;
    }

    return await this.cityRepository.findAndCount({
      where: {},
      take: data.take,
      skip: data.skip,
      order: order,
    });
  }

  getGeoData(ip: string) {
    if (!this.db) return null;
    return this.db.get(ip);
  }

  async updateUserCity(id: string, ip: string) {
    try {
      const data = await this.getGeoData(ip);
      if (!data) {
        this.logger.warn('No geo data returned for IP:', ip);
        return;
      }
      const user = await this.userRepository.findOneBy({ id });
      if (!user.city) {
        await this.userRepository.update(id, { city: data.city.names.en });
      }
    } catch (error) {
      this.logger.error('Error fetching geo data:', error);
    }
  }
}
