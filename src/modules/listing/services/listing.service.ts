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
import {
  CreateListingDto,
  UpdateListingDto,
} from '../dtos/request/listing.dto';
import { User } from '../../../entities';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

import { ForbiddenError } from '@nestjs/apollo';
import { StorageService } from '../../storage/storage.service';
import { SuccessResponse } from '../../../common/utils/success.response';

@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly storageService: StorageService,
  ) {}
  logger = new Logger(ListingService.name);
  async createListing(user: User, createListingDto: CreateListingDto) {
    try {
      createListingDto.userId = user.id;
      const listing = await this.listingRepository.create(createListingDto);

      return listing;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error.data || error.messages);
    }
  }

  async findAllListingForBuyer(data: PaginateAndSort) {
    try {
      if (data.where === undefined) {
        const listing = await this.listingRepository
          .queryBuilder('listing')
          .take(data.take)
          .skip(data.skip)

          .getManyAndCount();

        return listing;
      }
      const whereParam = `listing.${data.where.fieldToChose} = : field`;
      const listing = await this.listingRepository
        .queryBuilder('listing')
        .where(whereParam, { field: data.where.whereParam })
        .take(data.take)
        .skip(data.skip)
        .getManyAndCount();

      return listing;
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
            id: true,
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
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }

  async updateListing(editListingDto: UpdateListingDto, user: User) {
    try {
      const { id, ...partialUpdatePayload } = editListingDto;
      const listing = await this.listingRepository.findById(id);
      if (listing.userId !== user.id) {
        throw new ForbiddenError(
          'This user does not have the permision to update record',
        );
      }

      const update = await this.listingRepository.update(
        id,
        partialUpdatePayload,
      );
      return update;
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }

  async uploadListingImage(id: string, files: Express.Multer.File[]) {
    try {
      let uploadUrls: string[] = [];
      const uploadObject = {};

      const uploadPromises = files.map((file) =>
        this.storageService.upload(file),
      );
      uploadUrls = await Promise.all(uploadPromises);

      uploadUrls.forEach((value, index) => (uploadObject[index] = value));
      const stringifiedUploadObject = JSON.stringify(uploadObject);

      await this.listingRepository.update(id, {
        images: stringifiedUploadObject,
      });

      return new SuccessResponse('Upload successful');
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }
}
