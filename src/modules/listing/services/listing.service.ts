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
} from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import {
  AdminFilterAndSort,
  CreateListingDto,
  FlagListingInput,
} from '../dtos/request/listing.dto';
import { User } from '../../../entities';

import { ForbiddenError } from '@nestjs/apollo';
import { StorageService } from '../../file-handler/services/storage.service';

import { AttributeDto } from '../dtos/request/attributes.dto';
import { CreatePromotionInput } from '../dtos/request/promotion-input';
import { PromotionRepository } from '../repositories/promotion.repository';

import { AdPackageService } from '../../ad-package/services/ad-package.service';
import { Between, QueryFailedError } from 'typeorm';

import { addDaysToDate } from '../../../common/utils/helper';
import { FlagListingRepository } from '../repositories/flag-listing.repository';
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { I18nService } from 'nestjs-i18n';
import { SearchHistoryRepository } from '../repositories/search-history.repository';
import { CreateSearchHistoryInput } from '../dtos/request/create-search-history';

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
import { NotificationService } from '../../notification/services';
import { AttributeService } from './attribute.service';
import { ListingAttributeRepository } from '../repositories/listing-attributes.repository';
import { ListingTypeService } from './listing-type.service';
import { FurnishingStatusEnum } from '../../../common/enums';

@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly storageService: StorageService,
    private readonly adpackageService: AdPackageService,
    private readonly flagListingRepository: FlagListingRepository,
    private readonly i18n: I18nService,
    private readonly attributeService: AttributeService,
    private searchHistoryRepository: SearchHistoryRepository,
    private pushNotification: NotificationService,
    private listingTypeService: ListingTypeService,
    private readonly listingAttributesRepository: ListingAttributeRepository,
  ) {}
  logger = new Logger(ListingService.name);

  async createListing(user: User, createListingDto: CreateListingDto) {
    try {
      createListingDto.userId = user.id;
      const { attributes, ...rest } = createListingDto;

      const listingType = await this.listingTypeService.findOne(
        createListingDto.listingTypeId,
      );
      if (!listingType) {
        throw new BadRequestException(AppStrings.LISTING_TYPE_NOT_FOUND);
      }

      const gpsCoordinate = JSON.stringify(createListingDto.gpsCoordinate);

      const listing = await this.listingRepository.save({
        ...rest,
        gpsCoordinate: gpsCoordinate,
        userId: user.id,
      });

      const attributeEntities = await Promise.all(
        attributes.map(async (element) => {
          const attribute = await this.attributeService.findOne(
            element.attributeId,
          );

          if (!attribute) {
            throw new BadRequestException(
              `${element.attributeId} is ` + AppStrings.N0T_AN_ATTRIBUTE,
            );
          }

          return this.listingAttributesRepository.create({
            listing,
            attributeId: attribute.id,
            attribute,
            name: attribute.englishName,
            value: element.value,
          });
        }),
      );

      await this.listingAttributesRepository.insert(attributeEntities);

      /*
        Calculate furnished status from number of amenities added
        compared to number of amenities in listing type
      */
      const furnishedValue = listingType.attributeSets.length;

      let furnishedStatus = null; // Default to null
      if (attributes.length >= (furnishedValue * 100) / 60) {
        furnishedStatus = false;
      } else if (attributes.length === furnishedValue) {
        furnishedStatus = true;
      }

      switch (furnishedStatus) {
        case true:
          await this.listingRepository.update(listing.id, {
            furnished: FurnishingStatusEnum.ALL_FURNISHED,
          });
          break;
        case false:
          await this.listingRepository.update(listing.id, {
            furnished: FurnishingStatusEnum.FURNISHED,
          });
          break;
        case null:
          await this.listingRepository.update(listing.id, {
            furnished: FurnishingStatusEnum.UN_FURNISHED,
          });
          break;
      }

      return listing;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        error.message || 'An unexpected error occurred',
      );
    }
  }

  async findAllListingsForOwner(data: AttributeDto, user?: User) {
    try {
      const { take: initialTake, skip, sortField, directionToSort } = data;

      const orderOptions = {
        [sortField]: directionToSort,
      };

      const take = initialTake <= 20 ? initialTake : 20;

      const listing = await this.listingRepository.findAndCount({
        take,
        skip,
        where: { userId: user.id },
        relations: ['listingAttributes', 'listingType'],
        order: orderOptions,
      });

      return listing;
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }

  /***************************
   * Buyers
   ***************************/
  async findAllListingForBuyerUnauthenticated(
    paginateAndSort: CreateSearchHistoryInput,
  ) {
    try {
      const allColumns = this.listingRepository.metadata.columns.map(
        (column) => `listing.${column.propertyName}`,
      );
      const columnsToExclude = [
        'listing.price',
        'listing.deedNumber',
        'listing.poaNumber',
        'listing.iban',
        'listing.zatcaNumber',
      ];

      const columnsToSelect = allColumns.filter(
        (column) => !columnsToExclude.includes(column),
      );
      // Destructure input parameters
      const {
        type,
        listingId,
        sortField,
        directionToSort,
        skip,
        numberOfRooms,
        numberOfBathrooms,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        location,
        floor,
        furnishing,
        take: initialTake,
      } = paginateAndSort;

      // Ensures the take value does not exceed 20
      const take = Math.min(initialTake, 20);
      const featuredTake = Math.ceil(take / 3);
      let regularTake = take - featuredTake;

      // Determine sorting options
      const sortDirections = ['ASC', 'DESC'] as const;
      type SortDirection = (typeof sortDirections)[number];

      // Common query setup
      const baseQuery = (isFeatured: boolean) => {
        const query = this.listingRepository
          .createQueryBuilder('listing')

          .select(columnsToSelect)
          .where(
            'listing.isListingDisabled = :isListingDisabled AND listing.isListingSold = :isListingSold AND listing.isListingRented = :isListingRented',
            {
              isListingDisabled: false,
              isListingSold: false,
              isListingRented: false,
            },
          );

        if (isFeatured) {
          query
            .andWhere('listing.isListingPromoted = :isListingPromoted', {
              isListingPromoted: true,
            })
            .andWhere('listing.isListingFeatured = :isListingFeatured', {
              isListingFeatured: true,
            });
        } else {
          query.andWhere('listing.isListingFeatured = :isListingFeatured', {
            isListingFeatured: false,
          });
        }

        if (minPrice !== undefined && maxPrice !== undefined) {
          query.andWhere('listing.price BETWEEN :minPrice AND :maxPrice', {
            minPrice,
            maxPrice,
          });
        }

        if (type !== undefined) {
          query.andWhere('listing.purpose = :type', { type });
        }

        if (furnishing !== undefined) {
          query.andWhere('listing.furnished = :furnished', { furnishing });
        }

        if (listingId !== undefined) {
          query.andWhere('listing.listingTypeid = :listingTypeId', {
            listingTypeId: listingId,
          });
        }

        if (numberOfRooms !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...numberOfRooms)',
            { attributeName: 'Number of Rooms', numberOfRooms },
          );
        }

        if (numberOfBathrooms !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...numberOfBathrooms)',
            {
              attributeName: 'Number of Bathrooms',
              numberOfBathrooms,
            },
          );
        }

        if (minArea !== undefined && maxArea !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value BETWEEN :minArea AND :maxArea',
            { attributeName: 'Area', minArea, maxArea },
          );
        }

        if (floor !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...floor)',
            { attributeName: 'Level', floor },
          );
        }

        if (location !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...location)',
            { attributeName: 'Address', location },
          );
        }

        if (
          sortField &&
          sortDirections.includes(
            directionToSort.toUpperCase() as SortDirection,
          )
        ) {
          query.orderBy(
            `listing.${sortField}`,
            directionToSort.toUpperCase() as SortDirection,
          );
        } else {
          query
            .orderBy('listing.promotedDate', 'ASC')
            .addOrderBy('listing.isListingPromoted', 'DESC');
        }

        return query;
      };

      const featuredQuery = baseQuery(true);
      featuredQuery.take(featuredTake).skip(skip);

      const [featuredListings, featuredCount] = await featuredQuery
        .leftJoinAndSelect('listing.user', 'user')
        .leftJoinAndSelect('listing.listingAttributes', 'attributes')
        .leftJoinAndSelect('listing.listingType', 'listingType')

        .getManyAndCount();

      // Combine results

      if (featuredListings.length < featuredTake) {
        regularTake = regularTake + featuredTake - featuredListings.length;
      }
      const regularQuery = baseQuery(false);
      regularQuery.take(regularTake).skip(skip);

      const [regularListings, regularCount] = await regularQuery
        .leftJoinAndSelect('listing.user', 'user')
        .leftJoinAndSelect('listing.listingAttributes', 'attributes')
        .leftJoinAndSelect('listing.listingType', 'listingType')

        .getManyAndCount();
      const listing = [...featuredListings, ...regularListings];
      const total = featuredCount + regularCount;

      return { listing, total };
    } catch (error) {
      this.logger.log(error);
      throw error instanceof HttpException
        ? error
        : new BadRequestException(error.message);
    }
  }

  async findListingForBuyerAuthenticated(
    paginateAndSort: CreateSearchHistoryInput,
    user: User,
  ) {
    try {
      const allColumns = this.listingRepository.metadata.columns.map(
        (column) => `listing.${column.propertyName}`,
      );
      const columnsToExclude = [
        'listing.deedNumber',
        'listing.poaNumber',
        'listing.iban',
        'listing.zatcaNumber',
      ];

      const columnsToSelect = allColumns.filter(
        (column) => !columnsToExclude.includes(column),
      );
      // Destructure input parameters
      const {
        type,
        listingId,
        sortField,
        directionToSort,
        skip,
        numberOfRooms,
        numberOfBathrooms,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        location,
        floor,
        furnishing,
        take: initialTake,
      } = paginateAndSort;

      // Ensures the take value does not exceed 20
      const take = Math.min(initialTake, 20);
      const featuredTake = Math.ceil(take / 3);
      let regularTake = take - featuredTake;

      // Determine sorting options
      const sortDirections = ['ASC', 'DESC'] as const;
      type SortDirection = (typeof sortDirections)[number];

      // Common query setup
      const baseQuery = (isFeatured: boolean) => {
        const query = this.listingRepository
          .createQueryBuilder('listing')

          .select(columnsToSelect)
          .where(
            'listing.isListingDisabled = :isListingDisabled AND listing.isListingSold = :isListingSold AND listing.isListingRented = :isListingRented',
            {
              isListingDisabled: false,
              isListingSold: false,
              isListingRented: false,
            },
          );

        if (isFeatured) {
          query
            .andWhere('listing.isListingPromoted = :isListingPromoted', {
              isListingPromoted: true,
            })
            .andWhere('listing.isListingFeatured = :isListingFeatured', {
              isListingFeatured: true,
            });
        } else {
          query.andWhere('listing.isListingFeatured = :isListingFeatured', {
            isListingFeatured: false,
          });
        }

        if (minPrice !== undefined && maxPrice !== undefined) {
          query.andWhere('listing.price BETWEEN :minPrice AND :maxPrice', {
            minPrice,
            maxPrice,
          });
        }

        if (type !== undefined) {
          query.andWhere('listing.purpose = :type', { type });
        }

        if (furnishing !== undefined) {
          query.andWhere('listing.furnished = :furnished', { furnishing });
        }

        if (listingId !== undefined) {
          query.andWhere('listing.listingTypeid = :listingTypeId', {
            listingTypeId: listingId,
          });
        }

        if (numberOfRooms !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...numberOfRooms)',
            { attributeName: 'Number of Rooms', numberOfRooms },
          );
        }

        if (numberOfBathrooms !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...numberOfBathrooms)',
            {
              attributeName: 'Number of Bathrooms',
              numberOfBathrooms,
            },
          );
        }

        if (minArea !== undefined && maxArea !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value BETWEEN :minArea AND :maxArea',
            { attributeName: 'Area', minArea, maxArea },
          );
        }

        if (floor !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...floor)',
            { attributeName: 'Level', floor },
          );
        }

        if (location !== undefined) {
          query.andWhere(
            'attributes.name = :attributeName AND attributes.value IN (:...location)',
            { attributeName: 'Address', location },
          );
        }

        if (
          sortField &&
          sortDirections.includes(
            directionToSort.toUpperCase() as SortDirection,
          )
        ) {
          query.orderBy(
            `listing.${sortField}`,
            directionToSort.toUpperCase() as SortDirection,
          );
        } else {
          query
            .orderBy('listing.promotedDate', 'ASC')
            .addOrderBy('listing.isListingPromoted', 'DESC');
        }

        return query;
      };

      const featuredQuery = baseQuery(true);
      featuredQuery.take(featuredTake).skip(skip);

      const [featuredListings, featuredCount] = await featuredQuery
        .leftJoinAndSelect('listing.user', 'user')
        .leftJoinAndSelect('listing.listingAttributes', 'attributes')
        .leftJoinAndSelect('listing.listingType', 'listingType')

        .getManyAndCount();

      // Combine results

      if (featuredListings.length < featuredTake) {
        regularTake = regularTake + featuredTake - featuredListings.length;
      }
      const regularQuery = baseQuery(false);
      regularQuery.take(regularTake).skip(skip);

      const [regularListings, regularCount] = await regularQuery
        .leftJoinAndSelect('listing.user', 'user')
        .leftJoinAndSelect('listing.listingAttributes', 'attributes')
        .leftJoinAndSelect('listing.listingType', 'listingType')

        .getManyAndCount();
      const listing = [...featuredListings, ...regularListings];
      const total = featuredCount + regularCount;

      await this.searchHistoryRepository.save({ ...paginateAndSort, user });

      return { listing, total };
    } catch (error) {
      this.logger.log(error);
      throw error instanceof HttpException
        ? error
        : new BadRequestException(error.message);
    }
  }

  async getListingForAdmin(paginateAndSort: AdminFilterAndSort) {
    try {
      const orderOptions = {
        [paginateAndSort.sortField]: paginateAndSort.directionToSort,
      };

      const now = new Date();
      let whereCondition: any = {};

      // Specific field to filter by time period
      const dateField = 'createdAt';

      switch (paginateAndSort.timePeriod) {
        case 'today':
          whereCondition[dateField] = Between(startOfDay(now), endOfDay(now));
          break;
        case 'week':
          whereCondition[dateField] = Between(startOfWeek(now), endOfWeek(now));
          break;
        case 'month':
          whereCondition[dateField] = Between(
            startOfMonth(now),
            endOfMonth(now),
          );
          break;
        case 'year':
          whereCondition[dateField] = Between(startOfYear(now), endOfYear(now));
          break;
        default:
          whereCondition = {};
      }

      whereCondition = {
        ...whereCondition,
        isListingPromoted: paginateAndSort.isListinPromoted,
        isListingSold: paginateAndSort.isListingSold,
        isListingFlagged: paginateAndSort.isListingFlagged,
        isListingRented: paginateAndSort.isListingSold,
      };
      const [listing, total, flagged, promoted, sold, rented] =
        await Promise.all([
          this.listingRepository.find({
            where: whereCondition,
            relations: ['user', 'listingType'],

            select: {
              user: {
                firstName: true,
                lastName: true,
                language: true,
                arabicFirstName: true,
                arabicLastName: true,
                userType: true,
              },
            },

            order: orderOptions,
            skip: paginateAndSort.skip,
            take: paginateAndSort.take,
          }),
          this.listingRepository.count({ where: whereCondition }),
          this.listingRepository.count({ where: { isListingFlagged: true } }),
          this.listingRepository.count({ where: { isListingPromoted: true } }),
          this.listingRepository.count({
            where: { isListingSold: true },
          }),
          this.listingRepository.count({
            where: { isListingRented: true },
          }),
        ]);

      const analysis = {
        flagged,
        promoted,
        sold,
        rented,
      };

      return { listing, analysis, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOneListingForBuyer(id: string) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: id },
        relations: ['listingType', 'listingAttributes'],
        select: {
          id: true,

          // Purpose: true,
          rentingOption: true,
          featureDate: true,
          promotedDate: true,
          listingTypeId: true,
          city: true,
          country: true,
          street: true,
          district: true,

          gpsCoordinate: true,
          listingAttributes: true,
          images: true,
          panoramaView: true,
          offer: true,
          impressions: true,
          isListingPromoted: true,
          isListingFlagged: true,
          isListingSold: true,
          isListingRented: true,
          isListingFeatured: true,
          isListingDisabled: true,
          negotiable: true,
          createdAt: true,
          deletedAt: true,
          updatedAt: true,

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
      if (!listing) {
        throw new BadRequestException(AppStrings.LISTING_NOT_FOUND);
      }

      const newImpression = listing.impressions + 1;

      await this.listingRepository.update(listing.id, {
        impressions: newImpression,
      });

      listing.deedNumber = '';
      listing.zatcaNumber = '';
      listing.iban = '';

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

  async updateListing(
    editListingDto,
    // : UpdateListingDto
    user: User,
  ) {
    try {
      const subscribedUser: { id: string; name: string }[] = [];
      const { id, ...partialUpdatePayload } = editListingDto;

      const listing = await this.listingRepository.findOne({
        where: { id: id },
        relations: ['wishlist'],
      });
      if (listing.userId !== user.id) {
        throw new ForbiddenError(
          'This user does not have the permision to update record',
        );
      }

      const update = await this.listingRepository.update(
        id,
        partialUpdatePayload,
      );

      listing.wishlist.map((element) => {
        subscribedUser.push({ id: element.userId, name: user.name });
      });

      if (partialUpdatePayload.price != undefined && update) {
        for (const element of subscribedUser) {
          this.pushNotification.sendUsersNotification({
            title: 'New listing',
            message: `Hi${element.name}, Heads up! The price of an item in your wishlist has been updated. Check out the new price now.`,
            isEmail: true,
            isPushNotifcation: true,
            recipients: [element.id],
            deepLink: '',
          });
        }
      }
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
      const urlsToUpload: string[] = [];
      const uploadObject = {};

      const uploadPromises = files.map((file) =>
        this.storageService.upload(file),
      );
      uploadUrls = await Promise.all(uploadPromises);

      uploadUrls.forEach((value, index) => {
        const imageUrl = (uploadObject[index] = value);
        urlsToUpload.push(imageUrl);
      });
      const stringifiedUploadObject = JSON.stringify(urlsToUpload);

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
      } else throw new BadRequestException(error.message || error.data);
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

  async createPromotion(createPromotionInput: CreatePromotionInput) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: createPromotionInput.listingId },
      });

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
          isListingPromoted: true,
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
      const listing = await this.listingRepository.findOneOrFail({
        where: { id: flaglistingInput.listingId },
      });

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
        isListingDisabled: true,
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
        isListingDisabled: false,
      });

      return new SuccessResponse(AppStrings.LISTING_ENABLED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async deleteListing(user: User, id: string) {
    try {
      const listing = await this.listingRepository.findOneOrFail({
        where: { id: id },
      });
      if (listing.userId != user.id || user.userType != 'admin') {
        throw new BadRequestException('Only the creator can delete Listing');
      }
      await this.listingRepository.softDelete(id);

      return new SuccessResponse(AppStrings.LISTING_DELETED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  shareListing(user: User) {
    try {
      const message = this.i18n.t('messages.share-listing', {
        lang: user.language,
      });
      return new SuccessResponse('success', message);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async getSearchHistory(id: string) {
    try {
      const history = await this.searchHistoryRepository.find({
        where: { userId: id },
      });
      return history;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async getOneListingForAdmin(id: string) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: id },
        relations: ['user', 'promotion', 'feature'],
      });

      const newImpression = listing.impressions + 1;

      await this.listingRepository.update(listing.id, {
        impressions: newImpression,
      });

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

  async featureAListing(createFeatureInput: CreateFeatureInput) {
    try {
      let featured;
      const listing = await this.listingRepository.findOne({
        where: { id: createFeatureInput.listingId },
      });
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
          isListingFeatured: true,
          featureDate: new Date(),
        });
      }

      return featured;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
