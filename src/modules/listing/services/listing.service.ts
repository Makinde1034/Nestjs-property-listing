/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import {
  CreateListingDto,
  UpdateListingDto,
} from '../dtos/request/listing.dto';
import { User } from '../../../entities';

import { ForbiddenError } from '@nestjs/apollo';
import { StorageService } from '../../storage/storage.service';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AmenitiesRepository } from '../repositories/amenities.repository';
import {
  appartment,
  villa,
  farm,
  land,
  building,
} from '../constant/attributes';
import { AttributeDto } from '../dtos/request/attributes.dto';

@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly storageService: StorageService,

    private readonly amenitiesRepository: AmenitiesRepository,
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
  async findAllListingsForOwner(data: AttributeDto, user?: User) {
    try {
      const typeMappings = {
        villa,
        appartment,
        farm,
        land,
        building,
      };

      const selectedAttributes = typeMappings[data.listingType];
      if (!selectedAttributes) {
        throw new BadRequestException(
          `Invalid listing type: ${data.listingType}`,
        );
      }

      const listing = await this.listingRepository.findAndCount({
        where: { listingType: data.listingType, userId: user.id },
        select: ['id', 'deedNumber', 'propertyNumber', ...selectedAttributes],
      });

      return listing;
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }

  async findAllListings(data: AttributeDto) {
    try {
      const typeMappings = {
        villa,
        appartment,
        farm,
        land,
        building,
      };

      const selectedAttributes = typeMappings[data.listingType];
      if (!selectedAttributes) {
        throw new BadRequestException(
          `Invalid listing type: ${data.listingType}`,
        );
      }

      const listing = await this.listingRepository.findAndCount({
        where: { listingType: data.listingType },
        select: ['id', ...selectedAttributes],
      });

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
      const listing = await this.listingRepository.findOne({
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

      listing.deedNumber = '';

      return listing;
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

  async findAmenities() {
    try {
      return await this.amenitiesRepository.find();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException('Error retrieving amenities');
      }
    }
  }
}
