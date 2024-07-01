/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import {
  AdminFilterAndSort,
  CreateListingDto,
  FlagListingInput,
  UpdateListingAdminDto,
  UpdateListingDto,
} from '../dtos/request/listing.dto';
import { User } from '../../../entities';

import { ForbiddenError } from '@nestjs/apollo';
import { StorageService } from '../../file-handler/services/storage.service';

import { AmenitiesRepository } from '../repositories/amenities.repository';
import { apartment, villa, farm, land, building } from '../constant/attributes';
import { AttributeDto } from '../dtos/request/attributes.dto';
import { CreatePromotionInput } from '../dtos/request/promotion-input';
import { PromotionRepository } from '../repositories/promotion.repository';

import { AdPackageService } from '../../ad-package/services/ad-package.service';
import { Between, LessThanOrEqual, MoreThan, QueryFailedError } from 'typeorm';

import { addDaysToDate } from '../../../common/utils/helper';
import { FlagListingRepository } from '../repositories/flag-listing.repository';
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { I18nService } from 'nestjs-i18n';
import { UserService } from '../../user/services';
import { SearchHistoryRepository } from '../repositories/search-history.repository';
import { CreateSearchHistoryInput } from '../dtos/request/create-search-history';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { FeatureRepository } from '../repositories/feature.repository';
import { CreateFeatureInput } from '../dtos/request/feature-input';

@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly storageService: StorageService,

    private readonly amenitiesRepository: AmenitiesRepository,

    private readonly adpackageService: AdPackageService,

    private readonly flagListingRepository: FlagListingRepository,
    private readonly i18n: I18nService,
    private userService: UserService,
    private searchHistoryRepository: SearchHistoryRepository,
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
        apartment,
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

  async findAllListings(paginatAndSort: PaginateAndSort) {
    try {
      const orderOptions = {
        [paginatAndSort.sortField]: paginatAndSort.directionToSort,
      };
      const listing = await this.listingRepository.findAndCount({
        take: paginatAndSort.take,
        skip: paginatAndSort.skip,
        order: orderOptions,
        where: { disableListing: false },
      });

      return listing;
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }

  async findAllPromotedListings(data: CreateSearchHistoryInput, user: User) {
    try {
      const typeMappings = {
        villa,
        apartment,
        farm,
        land,
        building,
      };
      await this.searchHistoryRepository.save({ ...data, user });

      const selectedAttributes = typeMappings[data.listingType];
      if (!selectedAttributes) {
        throw new BadRequestException(
          `Invalid listing type: ${data.listingType}`,
        );
      }
      const date = new Date().toISOString();
      const listing = await this.listingRepository.findAndCount({
        where: {
          purpose: data.type,
          numberOfRooms: data.numberOfRooms,
          numberOfBathrooms: data.numberOfBathrooms,
          price: LessThanOrEqual(parseInt(data.price)),
          city: data.location,
          listingType: data.listingType,
          promoted: true,
          promotionExpiration: MoreThan(date),
        },
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
      if (!listing) {
        throw new BadRequestException(AppStrings.LISTING_NOT_FOUND);
      }

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
        this.logger.log(error);

        throw error;
      } else
        throw new BadRequestException(error.messages || error.data || error);
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

      return new SuccessResponse(
        AppStrings.UPLOAD_SUCCESSFUL,
        stringifiedUploadObject,
      );
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }

  async uploadPanoramaImage(id: string, file: Express.Multer.File) {
    try {
      const url = await this.storageService.upload(file);
      await this.listingRepository.update(id, {
        images: url,
      });

      return new SuccessResponse('Upload successful', url);
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.messages || error.data);
      }
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
          promoted: true,
          promotedDate: new Date(),
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
      const listing = await this.listingRepository.findByIdOrFail(
        flaglistingInput.listingId,
      );

      if (!listing) {
        throw new BadRequestException(AppStrings.LISTING_NOT_FOUND);
      } else {
        await this.flagListingRepository.save({
          userId,
          ...flaglistingInput,
          listing,
        });
        const date = new Date();

        await this.listingRepository.update(listing.id, { flaggedDate: date });

        return new SuccessResponse(AppStrings.LISTING_FLAG_SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          AppStrings.INTERNAL_SERVER_EXCEPTION,
        );
      }
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

  shareListing(user: User) {
    const message = this.i18n.t('messages.share-listing', {
      lang: user.language,
    });
    return new SuccessResponse('success', message);
  }

  async getSearchHistory(id: string) {
    const history = await this.searchHistoryRepository.find({
      where: { userId: id },
    });
    return history;
  }

  async getListingForAdmin(paginatAndSort: AdminFilterAndSort) {
    const orderOptions = {
      [paginatAndSort.sortField]: paginatAndSort.directionToSort,
    };

    const now = new Date();
    let whereCondition: any = {};

    switch (paginatAndSort.timePeriod) {
      case 'today':
        whereCondition = {
          [paginatAndSort.sortField]: Between(startOfDay(now), endOfDay(now)),
        };
        break;
      case 'week':
        whereCondition = {
          [paginatAndSort.sortField]: Between(startOfWeek(now), endOfWeek(now)),
        };
        break;
      case 'month':
        whereCondition = {
          [paginatAndSort.sortField]: Between(
            startOfMonth(now),
            endOfMonth(now),
          ),
        };
        break;
      case 'year':
        whereCondition = {
          [paginatAndSort.sortField]: Between(startOfYear(now), endOfYear(now)),
        };
        break;
      default:
        whereCondition = null;
    }

    const [listing, total] = await this.listingRepository.findAndCount({
      where: whereCondition,
      order: orderOptions,
      relations: ['promotion', 'flag', 'offer', 'user', 'feature'],
    });

    const flaggedListing = await this.listingRepository.findAll({
      where: { isListingFlagged: true },
    });
    const promotedListing = await this.listingRepository.findAll({
      where: {
        promoted: true,
      },
    });
    const soldListing = await this.listingRepository.findAll({
      where: { status: 'completed' },
    });

    const analysis = {
      flagged: flaggedListing.length,
      promoted: promotedListing.length,
      sold: soldListing.length,
    };

    return { listing, analysis, total };
  }

  async editListingForAdmin(editListingDto: UpdateListingAdminDto) {
    const listing = await this.listingRepository.update(
      editListingDto.id,
      editListingDto,
    );
    return listing;
  }

  async featureAListing(createFeatureInput: CreateFeatureInput) {
    let featured;
    const listing = await this.listingRepository.findById(
      createFeatureInput.listingId,
    );
    const adPackage = await this.adpackageService.findOne(
      createFeatureInput.adPackageId,
    );

    if (!adPackage) {
      throw new BadRequestException('Invalid Ad Package ');
    }

    if (!listing) {
      throw new BadRequestException('Invalid listing ');
    }

    if (adPackage && listing) {
      featured = await this.featureRepository.save({
        ...createFeatureInput,
        adPackage: { ...adPackage },
        listing: { ...listing },
      });
      const formatedDays = parseInt(adPackage.duration);
      const expirationDate = addDaysToDate(new Date(), formatedDays);
      await this.listingRepository.update(listing.id, {
        featureExpiration: expirationDate,
        featured: true,
        featureDate: new Date(),
      });
    }

    return featured;
  }
}
