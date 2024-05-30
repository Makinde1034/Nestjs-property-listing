/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import { CreateListingDto } from '../dtos/request/create-listing.dto';
import { User } from '../../../entities';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { FindOptionsOrder } from 'typeorm';

@Injectable()
export class ListingService {
  constructor(private readonly listingRepository: ListingRepository) {}
  logger = new Logger(ListingService.name);
  async createListing(user: User, createListingDto: CreateListingDto) {
    try {
      createListingDto.user_id = user.id;
      const listing = await this.listingRepository.create(createListingDto);

      return listing;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error.data || error.messages);
    }
  }

  async findAllListingForBuyer(data: PaginateAndSort) {
    try {
      const order: FindOptionsOrder<any> = {};
      if (data.direction_to_sort) {
        order[data.sortField] = data.direction_to_sort;
      }

      return await this.listingRepository.findAndCount({
        take: data.take,
        skip: data.skip,
        order: order,
      });
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }

  async findOneListingForBuyer(id: string) {
    try {
      const listing = await this.listingRepository.findAll({
        where: { id: id },
        relations: ['user'],
        select: {
          user: {
            phone: true,
            firstName: true,
            lastName: true,
            arabicFirstName: true,
            arabicLastName: true,
          },
        },
      });

      return listing[0];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }
}
