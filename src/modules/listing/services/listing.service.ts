/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import {
  CreateListingDto,
  FlagListingInput,
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
import { CreatePromotionInput } from '../dtos/request/promotion-input';
import { PromotionRepository } from '../repositories/promotion.repository';

import { AdPackageService } from '../../ad-package/services/ad-package.service';
import { MoreThan, QueryFailedError } from 'typeorm';
import { addDaysToDate } from '../../../common/utils/helper';
import { AppStrings } from '../../../common/messages/app.strings';
import { FlagListingRepository } from '../repositories/flag-listing.repository';

@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly storageService: StorageService,

    private readonly amenitiesRepository: AmenitiesRepository,

    private readonly adpackageService: AdPackageService,

    private readonly flagListingRepository: FlagListingRepository,
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

  async findAllPromotedListings(data: AttributeDto) {
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
      const date = new Date().toISOString();
      const listing = await this.listingRepository.findAndCount({
        where: {
          listingType: data.listingType,
          promoted: true,
          promotionExpiration: MoreThan(date),
        },
        select: ['id', ...selectedAttributes],
      });

      return listing;
    } catch (error) {
      console.log(error);
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
        relations: ['user', 'promotion'],
        select: {
          user: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
            arabicFirstName: true,
            arabicLastName: true,
          },
          promotion: {
            id: true,
            listingId: true,
            adPackage: { id: true, name: true },
          },
        },
      });

      const newImpression = listing.impressions + 1;

      await this.listingRepository.update(listing.id, {
        impressions: newImpression,
      });

      listing.deedNumber = '';
      listing.propertyNumber = '';

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

  async createPromotion(createPromotionInput: CreatePromotionInput) {
    try {
      const listing = await this.listingRepository.findById(
        createPromotionInput.listingId,
      );

      const adPackage = await this.adpackageService.findOne(
        createPromotionInput.adPackageId,
      );

      if (!adPackage) {
        throw new BadRequestException('Invalid Ad Package ');
      }

      if (!adPackage && !listing) {
        throw new BadRequestException('Invalid listing ');
      }

      if (adPackage && listing) {
        const promotion = await this.promotionRepository.save({
          ...createPromotionInput,
          adPackage: { ...adPackage },
          listing: { ...listing },
        });
        const formatedDays = parseInt(adPackage.duration);
        const expirationDate = addDaysToDate(new Date(), formatedDays);
        await this.listingRepository.update(listing.id, {
          promotionExpiration: expirationDate,
        });

        return promotion;
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof QueryFailedError) {
        if ((error as any).code === '23505') {
          throw new ConflictException('You already have this Ad running');
        }
      }
      throw new BadRequestException('You already have this Ad running');
    }
  }

  async flagListing(flaglistingInput: FlagListingInput, userId: string) {
    try {
      const listing = await this.listingRepository.findById(
        flaglistingInput.listingId,
      );

      await this.flagListingRepository.save({
        userId,
        ...flaglistingInput,
        listing,
      });

      return new SuccessResponse(AppStrings.LISTING_FLAG_SUCCESSFULL);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async viewFlaggedListing(findManyOptions) {
    try {
      const [flaggedListing, total] =
        await this.flagListingRepository.findAndCount(findManyOptions);

      return { flaggedListing, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async disableListing(listingId: string) {
    try {
      await this.listingRepository.update(listingId, {
        disableListing: true,
      });

      return new SuccessResponse(AppStrings.LISTING_DISABLE_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async enableListing(listingId: string) {
    try {
      await this.listingRepository.update(listingId, {
        disableListing: null,
      });

      return new SuccessResponse(AppStrings.LISTING_ENABLED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async deleteListing(listingId: string) {
    try {
      await this.listingRepository.softDelete(listingId);

      return new SuccessResponse(AppStrings.LISTING_DELETED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }
}
