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
  UpdateListingDto,
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
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { GpsCoordinateRepository } from '../repositories/gps-coordinate.repository';

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
    private gpsCoordinateRepository: GpsCoordinateRepository,
  ) {}
  logger = new Logger(ListingService.name);

  async createListing(user: User, createListingDto: CreateListingDto) {
    try {
      createListingDto.userId = user.id;
      const { attributes, gpsCoordinate, ...rest } = createListingDto;
      const listingType = await this.listingTypeService.findOne(
        createListingDto.listingTypeId,
      );

      if (!listingType) {
        throw new BadRequestException(AppStrings.LISTING_TYPE_NOT_FOUND);
      }

      // Flatten all attributes from attribute sets into a single array
      const allAttributes = listingType.attributeSets.flatMap(
        (element) => element.attributes,
      );

      // Check required attributes
      allAttributes.forEach((attribute) => {
        if (attribute.isRequired) {
          const match = attributes.some(
            (attr) => attr.attributeId === attribute.id,
          );
          if (!match) {
            throw new BadRequestException(
              `${attribute.englishName ? attribute.englishName : attribute.arabicName} is required`,
            );
          }
        }
      });

      const gps = await this.gpsCoordinateRepository.save(gpsCoordinate);

      const listing = await this.listingRepository.save({
        ...rest,
        gpsCoordinate: gps,
        userId: user.id,
      });

      const attributeEntities = await Promise.all(
        attributes.map(async (element) => {
          const attribute = await this.attributeService.findOneAttribute(
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

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
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

  async findOneListingForOwner(id: string, user?: User) {
    try {
      const listing = await this.listingRepository.findOneOrFail({
        where: { id: id },
        relations: ['listingAttributes', 'listingType', 'promotion'],
      });

      if (listing.userId != user.id) {
        throw new BadRequestException('Listing does not belong to this user');
      }

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

      const {
        gpsCoordinate,
        rentingOption,
        attributes,
        type,
        listingId,
        sortField,
        directionToSort,
        skip,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        take: initialTake,
      } = paginateAndSort;

      const attributeId: string[] = [];
      const attributeValue: string[] = [];
      const attributeIdRange: string[] = [];
      const attributeValueRange: [string, string][] = [];

      if (attributes) {
        attributes.forEach(({ attributeId: id, value }) => {
          try {
            const data: [string, string] | string[] = JSON.parse(value);
            if (Array.isArray(data)) {
              if (data.length === 2) {
                attributeIdRange.push(id);
                attributeValueRange.push(data as [string, string]);
              } else if (data.length === 1) {
                attributeId.push(id);
                attributeValue.push(data[0]);
              }
            }
          } catch (error) {
            this.logger.warn(
              `Invalid JSON format for attribute value: ${value}`,
            );
          }
        });
      }

      const take = Math.min(initialTake, 20);
      const featuredTake = Math.ceil(take / 3);
      let regularTake = take - featuredTake;

      const sortDirections = ['ASC', 'DESC'] as const;
      type SortDirection = (typeof sortDirections)[number];

      const baseQuery = (isFeatured: boolean) => {
        const query = this.listingRepository
          .createQueryBuilder('listing')
          .select(columnsToSelect)
          .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
          .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
          .leftJoinAndSelect('listing.listingType', 'listingType')
          .leftJoinAndSelect('listingType.attributeSets', 'attributeSets')
          .where(
            'listing.isListingDisabled = :isListingDisabled AND listing.isListingSold = :isListingSold AND listing.isListingRented = :isListingRented',
            {
              isListingDisabled: false,
              isListingSold: false,
              isListingRented: false,
            },
          );

        if (isFeatured) {
          query.andWhere(
            'listing.isListingPromoted = :isListingPromoted AND listing.isListingFeatured = :isListingFeatured',
            {
              isListingPromoted: true,
              isListingFeatured: true,
            },
          );
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

        if (gpsCoordinate) {
          const { lng, lat } = gpsCoordinate;

          // Join the gpsCoordinate relation
          query
            .leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate')
            .andWhere('gpsCoordinate.lng = :lng AND gpsCoordinate.lat = :lat', {
              lng,
              lat,
            });
        }

        if (rentingOption !== undefined) {
          query.andWhere('listing.rentingOption = :rentingOption', {
            rentingOption,
          });
        }

        if (type !== undefined) {
          query.andWhere('listing.purpose = :type', { type });
        }

        if (listingId !== undefined) {
          query.andWhere('listing.listingTypeId = :listingTypeId', {
            listingTypeId: listingId,
          });
        }

        if (attributes && attributes.length > 0) {
          if (attributeId.length > 0) {
            query.andWhere(
              'listingAttributes.id IN (:...attributeIds) AND listingAttributes.value IN (:...attributeValues)',
              {
                attributeIds: attributeId,
                attributeValues: attributeValue,
              },
            );
          }
          if (attributeIdRange.length > 0) {
            query.andWhere(
              'listingAttributes.id IN (:...attributeIdRange) AND listingAttributes.value BETWEEN :minValue AND :maxValue',
              {
                attributeIdRange,
                minValue: attributeValueRange[0]?.[0] || null,
                maxValue: attributeValueRange[0]?.[1] || null,
              },
            );
          }
        }

        if (minArea !== undefined && maxArea !== undefined) {
          query.andWhere(
            'listingAttributes.name = :attributeName AND listingAttributes.value BETWEEN :minArea AND :maxArea',
            { attributeName: 'Area', minArea, maxArea },
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

      const [featuredListings, featuredCount] =
        await featuredQuery.getManyAndCount();

      if (featuredListings.length < featuredTake) {
        regularTake += featuredTake - featuredListings.length;
      }

      const regularQuery = baseQuery(false);
      regularQuery.take(regularTake).skip(skip);

      const [regularListings, regularCount] =
        await regularQuery.getManyAndCount();

      const listing = [...featuredListings, ...regularListings].slice(0, take);
      const total = featuredCount + regularCount;

      return { listing, total };
    } catch (error) {
      this.logger.error('Error finding listings:', error);
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

      const {
        gpsCoordinate,
        rentingOption,
        attributes,
        type,
        listingId,
        sortField,
        directionToSort,
        skip,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        take: initialTake,
      } = paginateAndSort;

      const attributeId: string[] = [];
      const attributeValue: (string | [string, string])[] = [];

      if (attributes) {
        attributes.forEach(({ attributeId: id, value }) => {
          attributeId.push(id);

          try {
            const data: [string, string] | string[] = JSON.parse(value);
            if (Array.isArray(data)) {
              if (data.length === 2) {
                attributeValue.push(data as [string, string]);
              } else if (data.length === 1) {
                attributeValue.push(data[0]);
              }
            }
          } catch (error) {
            this.logger.warn(
              `Invalid JSON format for attribute value: ${value}`,
            );
          }
        });
      }

      const take = Math.min(initialTake, 20);
      const featuredTake = Math.ceil(take / 3);
      const regularTake = take - featuredTake;

      const sortDirections = ['ASC', 'DESC'] as const;
      type SortDirection = (typeof sortDirections)[number];

      const baseQuery = (isFeatured: boolean) => {
        const query = this.listingRepository
          .createQueryBuilder('listing')
          .select(columnsToSelect)
          .leftJoinAndSelect('listing.user', 'user')
          .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
          .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
          .leftJoinAndSelect('listing.listingType', 'listingType')
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
          query.andWhere('listing.isListingPromoted = :isListingPromoted', {
            isListingPromoted: false,
          });
        }

        if (rentingOption !== undefined) {
          query.andWhere('listing.rentingOption = :rentingOption', {
            rentingOption,
          });
        }
        if (gpsCoordinate) {
          const { lng, lat } = gpsCoordinate;

          // Join the gpsCoordinate relation
          query
            .leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate')
            .andWhere('gpsCoordinate.lng = :lng AND gpsCoordinate.lat = :lat', {
              lng,
              lat,
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

        if (listingId !== undefined) {
          query.andWhere('listing.listingTypeId = :listingTypeId', {
            listingTypeId: listingId,
          });
        }

        if (attributes && attributes.length > 0) {
          if (attributeId.length > 0) {
            query.andWhere('listingAttributes.id IN (:...attributeIds)', {
              attributeIds: attributeId,
            });
          }

          if (attributeValue.length > 0) {
            const [exactValues, rangeValues] = attributeValue.reduce(
              ([exact, range], value) => {
                if (Array.isArray(value) && value.length === 2) {
                  range.push(value);
                } else {
                  exact.push(value);
                }
                return [exact, range];
              },
              [[], []] as [string[], [string, string][]],
            );

            if (exactValues.length > 0) {
              query.andWhere('listingAttributes.value IN (:...exactValues)', {
                exactValues,
              });
            }

            if (rangeValues.length > 0) {
              const [minValue, maxValue] = rangeValues[0];
              query.andWhere(
                'listingAttributes.value BETWEEN :minValue AND :maxValue',
                { minValue, maxValue },
              );
            }
          }
        }

        if (minArea !== undefined && maxArea !== undefined) {
          query.andWhere(
            'listingAttributes.name = :attributeName AND listingAttributes.value BETWEEN :minArea AND :maxArea',
            { attributeName: 'Area', minArea, maxArea },
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

      const [featuredListings, featuredCount] =
        await featuredQuery.getManyAndCount();

      const regularQuery = baseQuery(false);
      regularQuery.take(regularTake).skip(skip);

      const [regularListings, regularCount] =
        await regularQuery.getManyAndCount();

      const listing = [...featuredListings, ...regularListings];
      const total = featuredCount + regularCount;

      await this.searchHistoryRepository.save({ ...paginateAndSort, user });

      return { listing, total };
    } catch (error) {
      this.logger.error('Error in findListingForBuyerAuthenticated:', error);
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

      // Apply time period filter
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
          whereCondition = {}; // No date filter applied
      }

      // Apply other filters
      whereCondition = {
        ...whereCondition,
        isListingPromoted: paginateAndSort.isListingPromoted,
        isListingSold: paginateAndSort.isListingSold,
        isListingFlagged: paginateAndSort.isListingFlagged,
        isListingRented: paginateAndSort.isListingRented,
      };

      // Perform queries
      const [listingResult, countsResult] = await Promise.all([
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
        this.listingRepository
          .createQueryBuilder('listing')
          .select('COUNT(*)', 'total')
          .addSelect(
            'SUM(CASE WHEN listing.isListingFlagged = true THEN 1 ELSE 0 END)',
            'flagged',
          )
          .addSelect(
            'SUM(CASE WHEN listing.isListingPromoted = true THEN 1 ELSE 0 END)',
            'promoted',
          )
          .addSelect(
            'SUM(CASE WHEN listing.isListingSold = true THEN 1 ELSE 0 END)',
            'sold',
          )
          .addSelect(
            'SUM(CASE WHEN listing.isListingRented = true THEN 1 ELSE 0 END)',
            'rented',
          )
          .where(whereCondition)
          .getRawOne(),
      ]);

      // Extract counts from the result
      const analysis = {
        flagged: Number(countsResult.flagged),
        promoted: Number(countsResult.promoted),
        sold: Number(countsResult.sold),
        rented: Number(countsResult.rented),
      };

      return {
        listing: listingResult,
        analysis,
        total: Number(countsResult.total),
      };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOneListingForBuyer(id: string) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: id },
        relations: [
          'user',
          'listingType',
          'listingAttributes',
          'gpsCoordinate',
        ],
        select: {
          user: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
            arabicFirstName: true,
            arabicLastName: true,
          },
          id: true,
          title: true,
          price: true,
          purpose: true,
          rentingOption: true,
          featureDate: true,
          promotedDate: true,
          listingTypeId: true,
          userId: true,
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

  async findOneListingForBuyerUnauthenticated(id: string) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: id },
        relations: ['gpsCoordinate', 'listingType', 'listingAttributes'],
        select: {
          id: true,
          title: true,

          purpose: true,
          rentingOption: true,
          featureDate: true,
          promotedDate: true,
          listingTypeId: true,
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

  //
  async updateListing(editListingDto: UpdateListingDto, user: User) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, gpsCoordinate, attributes, ...partialUpdatePayload } =
        editListingDto;

      // Fetch the listing with its relations
      const listing = await this.listingRepository.findOne({
        where: { id },
        relations: ['listingAttributes', 'wishlist'],
      });

      // Check permission
      if (listing.userId !== user.id) {
        throw new ForbiddenError(
          'This user does not have permission to update the record',
        );
      }

      // Update listing details
      const update = await this.listingRepository.update(
        id,
        partialUpdatePayload,
      );

      // Create a map for quick lookups of existing attributes
      const existingAttributesMap = new Map(
        listing.listingAttributes.map((attr) => [attr.attributeId, attr]),
      );

      // Collect promises for attribute updates and new attributes
      const updatePromises = [];
      const newAttributesPromises = [];

      for (const element of attributes) {
        const existingAttribute = existingAttributesMap.get(
          element.attributeId,
        );

        if (existingAttribute) {
          if (element.value !== existingAttribute.value) {
            updatePromises.push(
              this.listingAttributesRepository.update(existingAttribute.id, {
                value: element.value,
              }),
            );
          }
        } else {
          // Fetch attribute details only if needed
          newAttributesPromises.push(
            this.attributeService
              .findOneAttribute(element.attributeId)
              .then((attribute) => ({
                ...element,
                name: attribute.englishName,
                listing,
              })),
          );
        }
      }

      // Wait for all attribute updates to complete
      await Promise.all(updatePromises);

      // Save new attributes
      const newAttributes = await Promise.all(newAttributesPromises);
      await this.listingAttributesRepository.save(newAttributes);

      // Prepare notifications
      const wishlistUserIds = listing.wishlist.map((w) => w.userId);
      const notificationPromises = [];

      if (partialUpdatePayload.price != undefined) {
        for (const userId of wishlistUserIds) {
          notificationPromises.push(
            this.pushNotification.sendUsersNotification({
              title: 'New listing',
              message: `Hi ${user.name}, Heads up! The price of an item in your wishlist has been updated. Check out the new price now.`,
              isEmail: true,
              isPushNotification: true,
              recipients: [userId],
              deepLink: '',
            }),
          );
        }
      }

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);

      // Return the updated listing
      if (update.affected > 0) {
        return await this.listingRepository.findOneOrFail({
          where: { id },
          relations: ['user', 'listingType', 'listingAttributes'],
        });
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message || error.data);
      }
    }
  }

  async uploadListingImage(
    id: string,
    imageId: string,
    files: Express.Multer.File[],
  ) {
    try {
      const listing = await this.listingRepository.findOne({ where: { id } });

      if (!listing) {
        throw new BadRequestException('Listing not found');
      }

      const existingImages: any[] = listing.images
        ? JSON.parse(listing.images)
        : [];
      // This.logger.log('Existing images:', existingImages);

      // Upload the new files
      const uploadPromises = files.map((file) =>
        this.storageService.upload(file),
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      if (imageId) {
        // Update existing image
        let imageUpdated = false;
        existingImages.map((image, index) => {
          if (image.id == imageId) {
            existingImages[index].url = uploadedUrls[0]; // Assuming single file upload
            imageUpdated = true;
          }
        });

        if (!imageUpdated) {
          throw new BadRequestException('Image ID not found');
        }
      } else {
        // Add new images
        const newImages = uploadedUrls.map((url, index) => ({
          id: (existingImages.length + index).toString(), // Generate unique ID
          url,
          isPanorama: false, // Default value
        }));

        existingImages.push(...newImages);
      }

      // Stringify the updated images array for storage
      const stringifiedImages = JSON.stringify(existingImages);
      this.logger.log('Updated images:', stringifiedImages);

      // Save the updated images to the database
      await this.listingRepository.update(id, { images: stringifiedImages });

      return new SuccessResponse(AppStrings.UPLOAD_SUCCESSFUL, existingImages);
    } catch (error) {
      this.logger.error(error.message || error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Unexpected error occurred',
      );
    }
  }

  async uploadPanoramaImage(id: string, file: Express.Multer.File) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id },
      });

      if (!listing) {
        throw new BadRequestException('Listing not found');
      }

      const existingImages: any[] = listing.images
        ? JSON.parse(listing.images)
        : [];

      // Upload the new files
      const uploadedUrl = await this.storageService.upload(file);

      // Combine existing images with the newly uploaded ones
      const updatedImages = [...existingImages];

      const image = {
        id: updatedImages.length, // Increment ID based on the length of updatedImages
        uploadedUrl,
        isPanorama: true, // Default value, can be modified later
      };
      updatedImages.push(image);

      // Stringify the updated images array for storage
      const stringifiedImages = JSON.stringify(updatedImages);

      // Save the updated images to the database
      await this.listingRepository.update(id, {
        images: stringifiedImages,
      });

      await this.storageService.upload(file);
      await this.listingRepository.update(id, {
        images: stringifiedImages,
      });

      return new SuccessResponse('Upload successful', stringifiedImages);
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

  async viewFlaggedListing(paginateAndSort: PaginateAndSort) {
    try {
      const orderOptions = {
        [paginateAndSort.sortField]: paginateAndSort.directionToSort,
      };

      if (paginateAndSort.take && paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }
      const [flaggedListing, total] =
        await this.flagListingRepository.findAndCount({
          take: paginateAndSort.take,
          skip: paginateAndSort.skip,
          order: orderOptions,
        });

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
        relations: [
          'user',
          'listingAttributes',
          'listingType',

          'promotion',
          'feature',
        ],
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
