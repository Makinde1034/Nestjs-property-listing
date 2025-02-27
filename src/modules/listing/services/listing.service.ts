/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ListingRepository } from '../repositories/listing.repository';
import {
  AdminFilterAndSort,
  CompareListingInput,
  CreateListingDto,
  FlagListingInput,
  ListingActionApprovalInput,
  ListingActionInput,
  ListingImageFormDataInput,
  ListingImageInput,
  UpdateListingDto,
} from '../dtos/request/listing.dto';
import { Attribute, Listing, NotificationScope, User } from '../../../entities';

import { ForbiddenError } from '@nestjs/apollo';
import { StorageService } from '../../file-handler/services/storage.service';

import { AttributeDto } from '../dtos/request/attributes.dto';
import { CreatePromotionInput } from '../dtos/request/promotion-input';
import { PromotionRepository } from '../repositories/promotion.repository';

import { AdPackageService } from '../../ad-package/services/ad-package.service';
import { Between, In, LessThan, MoreThan } from 'typeorm';

import {
  addDaysToDate,
  filterDeletedImages,
  getLocationFromImage,
  haversine,
  isJsonString,
} from '../../../common/utils/helper';
import { FlagListingRepository } from '../repositories/flag-listing.repository';
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { I18nService } from 'nestjs-i18n';
import { SearchHistoryRepository } from '../repositories/search-history.repository';
import { CreateSearchHistoryInput } from '../dtos/request/create-search-history';

import { endOfDay, startOfDay, subMonths, subWeeks, subYears } from 'date-fns';
import { FeatureRepository } from '../repositories/feature.repository';
import { CreateFeatureInput } from '../dtos/request/feature-input';
import { NotificationService } from '../../notification/services';
import { AttributeService } from './attribute.service';
import { ListingAttributeRepository } from '../repositories/listing-attributes.repository';
import { ListingTypeService } from './listing-type.service';
import {
  FurnishingStatusEnum,
  NotificationEvent,
  UserProfileTypeEnum,
} from '../../../common/enums';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { GpsCoordinateRepository } from '../repositories/gps-coordinate.repository';
import { AttributeRepository } from '../repositories';
import { ChildIssueRepository } from '../../issue/repositories/child-issue.repository';
import { IssueRepository } from '../../issue/repositories';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { ActivityEnum } from '../../../common/enums/activitys';
import { Feature } from '../../../entities/feature.entity';
import { CompareRepository } from '../repositories/compare.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NotificationScopeRepository,
  RoleRepository,
} from '../../user/repositories';
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';
import { ListingStatus } from '../../../common/enums/status.enum';
import { PlaceRepository } from '../repositories/place.repositories';

import { PermissionsEnum } from '../../../common/enums/permission.enum';

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
    private attributeRepository: AttributeRepository,
    private childIssueRepository: ChildIssueRepository,
    private issueRepository: IssueRepository,
    private readonly compareRepository: CompareRepository,
    private readonly placeRepository: PlaceRepository,
    private readonly activityLogsService: ActivityLogService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationScopeRepository: NotificationScopeRepository,

    private readonly roleRepository: RoleRepository,
  ) {}
  logger = new Logger(ListingService.name);

  async createListing(user: User, createListingDto: CreateListingDto) {
    try {
      createListingDto.userId = user.id;
      const { attributes, gpsCoordinate, places, ...rest } = createListingDto;
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
      let place;
      if (places) {
        place = await this.placeRepository.save(places);
      }
      const listing = await this.listingRepository.save({
        ...rest,
        gpsCoordinate: gps,
        userId: user.id,
        place: place,
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
            value:
              typeof element.value === 'string'
                ? element.value.replace(/\b\w/g, (char) => char.toUpperCase())
                : element.value,
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
      let { sortField, directionToSort } = data;
      const { take: initialTake, skip, where } = data;

      const sortDirections = ['ASC', 'DESC'] as const;
      if (sortField && directionToSort) {
        sortField = data.sortField;
        directionToSort =
          directionToSort.toUpperCase() as (typeof sortDirections)[number];
      } else {
        sortField = null; // No sorting if not provided
      }

      const take = initialTake <= 20 ? initialTake : 20;
      const query = this.listingRepository
        .createQueryBuilder('listing')
        .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
        .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
        .leftJoinAndSelect('listing.listingType', 'listingType')
        .loadRelationCountAndMap('listing.offers', 'listing.offer')
        .where('listing.userId = :id', { id: user.id })
        .andWhere('status = :status', { status: ListingStatus.ACCEPTED });

      // ✅ Apply additional `where` conditions correctly
      if (where?.fieldToChose && where?.whereParam !== undefined) {
        query.andWhere(`listing.${where.fieldToChose} = :whereParam`, {
          whereParam: where.whereParam,
        });
      }

      // ✅ Ensure sorting is applied correctly
      if (sortField && directionToSort) {
        query.orderBy(
          `listing.${sortField}`,
          directionToSort as 'ASC' | 'DESC',
          'NULLS LAST',
        );
      }

      // ✅ Limit results properly
      query.take(take).skip(skip);

      // ✅ Fetch results
      const [listing, count] = await query.getManyAndCount();
      const result = listing.map((element) => this.transformListing(element));

      return { listing: result, total: count };
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.messages || error.data);
      }
    }
  }

  async findOneListingForOwner(id: string, user?: User) {
    try {
      const result = await this.listingRepository.findOneOrFail({
        where: { id: id },
        relations: ['listingAttributes', 'listingType', 'promotion'],
      });

      if (result.userId != user.id) {
        throw new BadRequestException('Listing does not belong to this user');
      }
      const newImpression = result.impressions + 1;

      this.listingRepository
        .createQueryBuilder()
        .update()
        .set({ impressions: newImpression })
        .where('id = :id', { id: result.id })
        .execute();

      const listing = this.transformListing(result);

      return listing;
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else throw new BadRequestException(error.messages || error.data);
    }
  }
  async findListingForDashboard(id: string, user?: User) {
    try {
      const result = await this.listingRepository.findOneOrFail({
        where: { id: id },
        relations: ['listingAttributes', 'listingType', 'promotion'],
      });

      if (result.userId != user.id) {
        throw new BadRequestException('Listing does not belong to this user');
      }
      const newImpression = result.impressions + 1;

      this.listingRepository
        .createQueryBuilder()
        .update()
        .set({ impressions: newImpression })
        .where('id = :id', { id: result.id })
        .execute();

      const listing = this.transformListing(result);

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
        purpose,
        listingTypeId,
        place,
        skip,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        take: initialTake,
      } = paginateAndSort;
      let { sortField, directionToSort } = paginateAndSort;

      const attributeId: string[] = [];
      const attributeValue: string[] = [];
      const attributeIdRange: string[] = [];
      const attributeValueRange: [string, string][] = [];
      let result;
      let total;

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
              `Invalid JSON format for attribute value: ${value}, error: ${error.message}`,
            );
          }
        });
      }

      const take = Math.min(initialTake, 20);

      const baseQuery = () => {
        const query = this.listingRepository
          .createQueryBuilder('listing')
          .select(columnsToSelect)
          .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
          .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
          .leftJoinAndSelect('listing.listingType', 'listingType')
          .leftJoin('listing.wishlist', 'wishlist')
          .addSelect(['wishlist.id'])
          .leftJoin('listingType.attributeSets', 'attributeSets')

          .where(
            'listing.isListingDisabled = :isListingDisabled AND listing.isListingSold = :isListingSold AND listing.isListingRented = :isListingRented AND listing.published IS true AND listingType.deletedAt IS NULL AND  status = :status',
            {
              isListingDisabled: false,
              isListingSold: false,
              isListingRented: false,
              status: ListingStatus.ACCEPTED,
            },
          );

        if (rentingOption) {
          query.andWhere('listing.rentingOption = :rentingOption', {
            rentingOption,
          });
        }

        if (place) {
          query.andWhere(
            'listing.place.id = :placeId AND listing.place.type = :type',
            {
              placeId: place.id,
              type: place.type,
            },
          );
        }

        if (gpsCoordinate) {
          const { lng, lat } = gpsCoordinate;
          const radiusInKm = 30; // Radius in kilometers

          query
            .leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate')
            .andWhere(
              `
              ST_DistanceSphere(
                ST_MakePoint(gpsCoordinate.lng, gpsCoordinate.lat),
                ST_MakePoint(:lng, :lat)
              ) <= :distance
            `,
              {
                lng,
                lat,
                distance: radiusInKm * 1000, // Convert kilometers to meters
              },
            );
        } else {
          query.leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate');
        }

        if (minPrice && maxPrice) {
          query.andWhere('listing.price BETWEEN :minPrice AND :maxPrice', {
            minPrice,
            maxPrice,
          });
        }

        if (purpose) {
          query.andWhere('listing.purpose = :purpose', { purpose });
        }

        if (listingTypeId) {
          query.andWhere('listing.listingTypeId = :listingTypeId', {
            listingTypeId,
          });
        }

        if (attributes && attributes.length > 0) {
          if (attributeId.length > 0) {
            query.andWhere(
              'listingAttributes.attributeId IN (:...attributeIds) AND listingAttributes.value IN (:...attributeValues)',
              {
                attributeIds: attributeId,
                attributeValues: attributeValue,
              },
            );
          }

          if (attributeIdRange.length > 0) {
            query.andWhere(
              'listingAttributes.attributeId IN (:...attributeIdRange) AND listingAttributes.value BETWEEN :minValue AND :maxValue',
              {
                attributeIdRange,
                minValue: attributeValueRange[0]?.[0] || null,
                maxValue: attributeValueRange[0]?.[1] || null,
              },
            );
          }
        }

        if (minArea && maxArea) {
          query.andWhere(
            'listingAttributes.name = :attributeName AND listingAttributes.value BETWEEN :minArea AND :maxArea',
            { attributeName: 'Area', minArea, maxArea },
          );
        }

        if (sortField && directionToSort) {
          const sortDirections = ['ASC', 'DESC'] as const;
          if (
            sortDirections.includes(
              directionToSort.toUpperCase() as (typeof sortDirections)[number],
            )
          ) {
            query.orderBy(
              `listing.${sortField}`,
              directionToSort.toUpperCase() as (typeof sortDirections)[number],
              'NULLS LAST',
            );
          }
        }

        return query;
      };

      if (paginateAndSort.sortField && paginateAndSort.directionToSort) {
        sortField = paginateAndSort.sortField;
        directionToSort = paginateAndSort.directionToSort.toUpperCase() as
          | 'ASC'
          | 'DESC';

        if (!['ASC', 'DESC'].includes(directionToSort)) {
          throw new Error(`Invalid sort direction: ${directionToSort}`);
        }
      }

      if (paginateAndSort.sortField) {
        const [listings, count] = await baseQuery()
          .take(take)
          .skip(skip)
          .getManyAndCount();

        result = listings;
        total = count;
      } else {
        const mergedListings: Listing[] = [];
        const promotedRatio = 5; // 1 promoted for every 5 regular
        const featuredRatio = 6; // 1 featured for every 6 regular

        let promotedIndex = 0;
        let featuredIndex = 0;
        const splitTake = Math.ceil(take / 4); // Divide `take` equally for featured and promoted
        const splitSkip = Math.ceil(skip / 4); // Divide `skip` equally for featured and promoted

        if (take > featuredRatio) {
          const [featured, promoted, regular] = await Promise.all([
            baseQuery()
              .take(splitTake)
              .skip(splitSkip)
              .andWhere('listing.featureDate IS NOT NULL') // Only fetch featured listings
              .orderBy('listing.featureDate', 'DESC', 'NULLS LAST')
              .getManyAndCount(),

            baseQuery()
              .take(splitTake)
              .skip(splitSkip)
              .andWhere('listing.promotedDate IS NOT NULL') // Only fetch promoted listings
              .orderBy('listing.promotedDate', 'DESC', 'NULLS LAST')
              .getManyAndCount(),

            baseQuery()
              .take(take - splitTake)
              .skip(skip - splitSkip)
              .andWhere(
                'listing.promotedDate IS NULL AND listing.featureDate IS NULL',
              ) // Exclude promoted and featured listings
              .orderBy('listing.featureDate', 'DESC', 'NULLS LAST')
              .addOrderBy('listing.promotedDate', 'DESC', 'NULLS LAST')
              .getManyAndCount(),
          ]);

          // Destructure results
          const [featuredListings, totalFeatured] = featured;
          const [promotedListings, totalPromoted] = promoted;
          const [regularListings, totalRegular] = regular;
          total = totalRegular + totalFeatured + totalPromoted;

          // Iterate through regular listings
          for (let i = 0; i < Math.min(take, regularListings.length); i++) {
            // Add regular listing if available
            if (regularListings[i]) {
              mergedListings.push(regularListings[i]);
            }

            // Check if a promoted listing needs to be added
            if (
              (i + 1) % promotedRatio === 0 &&
              promotedIndex < promotedListings.length
            ) {
              mergedListings.push(promotedListings[promotedIndex]);
              promotedIndex++;
            }

            // Check if a featured listing needs to be added
            if (
              (i + 1) % featuredRatio === 0 &&
              featuredIndex < featuredListings.length
            ) {
              mergedListings.push(featuredListings[featuredIndex]);
              featuredIndex++;
            }
          }

          // Add remaining promoted listings if any

          result = mergedListings;
        } else {
          const [listing, count] = await baseQuery()
            .take(take)
            .skip(skip)
            .orderBy('listing.featureDate', 'DESC', 'NULLS LAST')
            .addOrderBy('listing.promotedDate', 'DESC', 'NULLS LAST')
            .getManyAndCount();

          total = count;
          result = listing;
        }
      }

      const listingToParse: Listing[] = [...result];

      const listing = listingToParse.map((element) => {
        if (!element) {
        } else {
          return this.transformListing(element);
        }
      });

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
      // Extract parameters from input
      const {
        gpsCoordinate,
        rentingOption,
        attributes,
        listingTypeId,

        skip,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        place,
        searchHistory,
        take: initialTake,
        purpose,
      } = paginateAndSort;

      let { sortField, directionToSort } = paginateAndSort;

      // Define columns to exclude from selection
      const columnsToExclude = [
        'deedNumber',
        'poaNumber',
        'iban',
        'zatcaNumber',
      ];

      const attributeId: string[] = [];
      const attributeValue: string[] = [];
      const attributeIdRange: string[] = [];
      const attributeValueRange: [string, string][] = [];

      let result;
      let total;

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
              `Invalid JSON format for attribute value: ${value}, error: ${error.message}`,
            );
          }
        });
      }

      // Select only the necessary columns
      const columnsToSelect = this.listingRepository.metadata.columns
        .map((column) => `listing.${column.propertyName}`)
        .filter((column) => !columnsToExclude.includes(column.split('.')[1]));

      const take = Math.min(initialTake, 20);

      // Construct base query
      const baseQuery = () => {
        const query = this.listingRepository
          .createQueryBuilder('listing')
          .select(columnsToSelect)
          .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
          .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
          .leftJoinAndSelect('listing.listingType', 'listingType')
          .leftJoin('listing.wishlist', 'wishlist')
          .addSelect(['wishlist.id'])
          .leftJoin('listingType.attributeSets', 'attributeSets')

          .where(
            'listing.isListingDisabled = :isListingDisabled AND listing.isListingSold = :isListingSold AND listing.isListingRented = :isListingRented   AND listing.published IS true AND listingType.deletedAt IS NULL AND  status = :status',
            {
              isListingDisabled: false,
              isListingSold: false,
              isListingRented: false,
              status: ListingStatus.ACCEPTED,
            },
          );

        if (rentingOption !== undefined) {
          query.andWhere('listing.rentingOption = :rentingOption', {
            rentingOption,
          });
        }

        if (place) {
          query.andWhere(
            'listing.place.id = :placeId AND listing.place.type = :type',
            {
              placeId: place.id,
              type: place.type,
            },
          );
        }

        if (gpsCoordinate) {
          const { lng, lat } = gpsCoordinate;
          const radiusInKm = 30; // Radius in kilometers

          query
            .leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate')
            .andWhere(
              `
              ST_DistanceSphere(
                ST_MakePoint(gpsCoordinate.lng, gpsCoordinate.lat),
                ST_MakePoint(:lng, :lat)
              ) <= :distance
            `,
              {
                lng,
                lat,
                distance: radiusInKm * 1000, // Convert kilometers to meters
              },
            );
        } else {
          query.leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate');
        }

        const parsedMinPrice =
          minPrice !== undefined ? Number(minPrice) : undefined;
        const parsedMaxPrice =
          maxPrice !== undefined ? Number(maxPrice) : undefined;

        if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined) {
          query.andWhere('listing.price BETWEEN :minPrice AND :maxPrice', {
            minPrice: parsedMinPrice,
            maxPrice: parsedMaxPrice,
          });
        } else if (parsedMinPrice !== undefined) {
          query.andWhere('listing.price >= :minPrice', {
            minPrice: parsedMinPrice,
          });
        } else if (parsedMaxPrice !== undefined) {
          query.andWhere('listing.price <= :maxPrice', {
            maxPrice: parsedMaxPrice,
          });
        }

        if (purpose !== undefined) {
          query.andWhere('listing.purpose = :purpose', { purpose });
        }

        if (listingTypeId !== undefined) {
          query.andWhere('listing.listingTypeId = :listingTypeId', {
            listingTypeId,
          });
        }

        if (attributes && attributes.length > 0) {
          if (attributeId.length > 0) {
            query.andWhere(
              'listingAttributes.attributeId IN (:...attributeIds) AND listingAttributes.value IN (:...attributeValues)',
              {
                attributeIds: attributeId,
                attributeValues: attributeValue,
              },
            );
          }

          if (attributeIdRange.length > 0) {
            query.andWhere(
              'listingAttributes.attributeId IN (:...attributeIdRange) AND listingAttributes.value BETWEEN :minValue AND :maxValue',
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

        if (sortField && directionToSort) {
          const sortDirections = ['ASC', 'DESC'] as const;
          const direction =
            directionToSort.toUpperCase() as (typeof sortDirections)[number];

          if (sortDirections.includes(direction)) {
            // Add condition to sort where the date is not null
            // query.andWhere(`listing.${sortField}`);

            // Apply sorting to the query

            query.orderBy(`listing.${sortField}`, direction, 'NULLS LAST');
          }
        }
        return query;
      };

      if (paginateAndSort.sortField && paginateAndSort.directionToSort) {
        sortField = paginateAndSort.sortField;
        directionToSort = paginateAndSort.directionToSort.toUpperCase() as
          | 'ASC'
          | 'DESC';

        if (!['ASC', 'DESC'].includes(directionToSort)) {
          throw new Error(`Invalid sort direction: ${directionToSort}`);
        }
      }

      if (paginateAndSort.sortField) {
        const start = Date.now();
        const [listings, count] = await baseQuery()
          .take(take)
          .skip(skip)
          .getManyAndCount();

        const end = Date.now();

        result = listings;
        total = count;
      } else {
        // Combine listings if needed
        const mergedListings: Listing[] = [];
        const promotedRatio = 5; // 1 promoted for every 5 regular
        const featuredRatio = 6; // 1 featured for every 6 regular

        let promotedIndex = 0;
        let featuredIndex = 0;
        const splitTake = Math.ceil(take / 4); // Divide `take` equally for featured and promoted
        const splitSkip = Math.ceil(skip / 4); // Divide `skip` equally for featured and promoted

        if (take > featuredRatio) {
          const [featured, promoted, regular] = await Promise.all([
            baseQuery()
              .take(splitTake)
              .skip(splitSkip)
              .andWhere('listing.featureDate IS NOT NULL') // Only fetch featured listings
              .orderBy('listing.featureDate', 'DESC', 'NULLS LAST')
              .getManyAndCount(),

            baseQuery()
              .take(splitTake)
              .skip(splitSkip)
              .andWhere('listing.promotedDate IS NOT NULL') // Only fetch promoted listings
              .orderBy('listing.promotedDate', 'DESC', 'NULLS LAST')
              .getManyAndCount(),

            baseQuery()
              .take(take - splitTake)
              .skip(skip - splitSkip)
              .andWhere(
                'listing.promotedDate IS NULL AND listing.featureDate IS NULL',
              ) // Exclude promoted and featured listings
              .orderBy('listing.featureDate', 'DESC', 'NULLS LAST')
              .addOrderBy('listing.promotedDate', 'DESC', 'NULLS LAST')
              .getManyAndCount(),
          ]);

          // Destructure results
          const [featuredListings, totalFeatured] = featured;
          const [promotedListings, totalPromoted] = promoted;
          const [regularListings, totalRegular] = regular;
          total = totalRegular + totalFeatured + totalPromoted;

          // Iterate through regular listings
          for (let i = 0; i < Math.min(take, regularListings.length); i++) {
            // Add regular listing if available
            if (regularListings[i]) {
              mergedListings.push(regularListings[i]);
            }

            // Check if a promoted listing needs to be added
            if (
              (i + 1) % promotedRatio === 0 &&
              promotedIndex < promotedListings.length
            ) {
              mergedListings.push(promotedListings[promotedIndex]);
              promotedIndex++;
            }

            // Check if a featured listing needs to be added
            if (
              (i + 1) % featuredRatio === 0 &&
              featuredIndex < featuredListings.length
            ) {
              mergedListings.push(featuredListings[featuredIndex]);
              featuredIndex++;
            }
          }

          // Add remaining promoted listings if any

          result = mergedListings;
        } else {
          const [listing, count] = await baseQuery()
            .take(take)
            .skip(skip)
            .orderBy('listing.featureDate', 'DESC', 'NULLS LAST')
            .addOrderBy('listing.promotedDate', 'DESC', 'NULLS LAST')
            .getManyAndCount();

          total = count;
          result = listing;
        }
      }

      const listingToParse = [...result];

      const listing = listingToParse.map((element) => {
        return this.transformListing(element);
      });

      // Save search history if needed
      if (searchHistory) {
        await this.saveSearchHistory(
          {
            attributes,
            gpsCoordinate,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            rentingOption,
            purpose,
            listingTypeId,
          },
          user,
        );
      }

      return { listing, total };
    } catch (error) {
      this.logger.error('Error in findListingForBuyerAuthenticated:', error);
      throw error instanceof HttpException
        ? error
        : new BadRequestException(error.message);
    }
  }

  async getListingForAdmin(paginateAndSort: AdminFilterAndSort) {
    const now = new Date();
    const whereCondition: any = {};

    const dateField = 'createdAt';

    let sortField;
    let directionToSort;
    if (paginateAndSort.sortField && paginateAndSort.directionToSort) {
      sortField = paginateAndSort.sortField;
      directionToSort = paginateAndSort.directionToSort.toUpperCase() as
        | 'ASC'
        | 'DESC';

      if (!['ASC', 'DESC'].includes(directionToSort)) {
        throw new Error(`Invalid sort direction: ${directionToSort}`);
      }
    }

    const timePeriods: Record<string, [Date, Date]> = {
      today: [startOfDay(now), endOfDay(now)],
      week: [subWeeks(now, 1), now],
      month: [subMonths(now, 1), now],
      year: [subYears(now, 1), now],
    };

    const period = timePeriods[paginateAndSort.timePeriod];
    if (period) {
      whereCondition[dateField] = Between(...period);
    } else {
      throw new Error(`Unsupported time period: ${paginateAndSort.timePeriod}`);
    }

    if (
      paginateAndSort.deactivated !== undefined &&
      paginateAndSort.deactivated !== null
    ) {
      whereCondition.isListingDisabled = paginateAndSort.deactivated;
    }
    if (
      paginateAndSort.active !== undefined &&
      paginateAndSort.active !== null
    ) {
      whereCondition.isListingDisabled = paginateAndSort.active;
    }

    if (
      paginateAndSort.isListingPromoted !== undefined &&
      paginateAndSort.isListingPromoted !== null
    ) {
      whereCondition.isListingPromoted = paginateAndSort.isListingPromoted;
    }
    if (
      paginateAndSort.isListingSold !== undefined &&
      paginateAndSort.isListingSold !== null
    ) {
      whereCondition.isListingSold = paginateAndSort.isListingSold;
    }
    if (
      paginateAndSort.isListingFlagged !== undefined &&
      paginateAndSort.isListingFlagged !== null
    ) {
      whereCondition.isListingFlagged = paginateAndSort.isListingFlagged;
    }

    if (
      paginateAndSort.isListingFeatured !== undefined &&
      paginateAndSort.isListingFeatured !== null
    ) {
      whereCondition.isListingFeatured = paginateAndSort.isListingFeatured;
    }
    if (
      paginateAndSort.isListingRented !== undefined &&
      paginateAndSort.isListingRented !== null
    ) {
      whereCondition.isListingRented = paginateAndSort.isListingRented;
    }
    if (
      paginateAndSort.status !== undefined &&
      paginateAndSort.status !== null
    ) {
      whereCondition.status = paginateAndSort.status;
    }

    const quotedColumnName = (column: string) => `"listing"."${column}"`;

    try {
      const [listingResult, countsResult] = await Promise.all([
        this.listingRepository
          .createQueryBuilder('listing')
          .select([
            'listing.id',
            'listing.title',
            'listing.isListingDisabled',
            'listing.isListingFlagged',
            'listing.isListingFeatured',
            'listing.isListingSold',
            'listing.isListingRented',
            'listing.isListingPromoted',
            'listing.price',
            'listing.status',
            'listing.stage',
            'listing.isListingVerified',
            'listing.createdAt',
          ])
          .leftJoin('listing.listingType', 'listingType')
          .leftJoin('listing.user', 'user')
          .addSelect([
            'listingType.id',
            'listingType.englishName',
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.language',
            'user.arabicFirstName',
            'user.arabicLastName',
            'user.userType',
            'user.email',
          ])
          .where(whereCondition)
          .andWhere('listing.published = true')
          .andWhere('listingType.deletedAt IS NULL')

          .orderBy(sortField, directionToSort, 'NULLS LAST')
          .skip(paginateAndSort.skip)
          .take(paginateAndSort.take)
          .getMany(),

        this.listingRepository
          .createQueryBuilder('listing')
          .select('COUNT(*)', 'total')
          .addSelect(
            `SUM(${quotedColumnName('isListingFlagged')}::int)`,
            'flagged',
          )
          .addSelect(
            `SUM(${quotedColumnName('isListingPromoted')}::int)`,
            'promoted',
          )
          .addSelect(`SUM(${quotedColumnName('isListingSold')}::int)`, 'sold')
          .addSelect(
            `SUM(${quotedColumnName('isListingRented')}::int)`,
            'rented',
          )
          .where(whereCondition)
          .getRawOne(),
      ]);

      const analysis = {
        flagged: Number(countsResult.flagged),
        promoted: Number(countsResult.promoted),
        sold: Number(countsResult.sold),
        rented: Number(countsResult.rented),
      };

      const listing = listingResult.map((element) => {
        return this.transformListing(element);
      });

      return {
        listing: listing,
        analysis,
        total: Number(countsResult.total),
      };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async getOneListingForAdmin(id: string) {
    try {
      const listing = await this.listingRepository.findOneOrFail({
        where: { id },
        relations: ['user'],
        select: {
          id: true,
          title: true,
          price: true,
          purpose: true,
          rentingOption: true,
          impressions: true,
          flaggedDate: true,
          listingTypeId: true,
          bundleType: true,
          promotedDate: true,
          promotionExpiration: true,
          featureDate: true,
          featureExpiration: true,
          isListingPromoted: true,
          isListingFlagged: true,
          isListingSold: true,
          isListingRented: true,
          isListingFeatured: true,
          isListingDisabled: true,
          isListingVerified: true,
          images: true,
          status: true,
          stage: true,

          listingType: {
            id: true,
            englishName: true,
          },
          user: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
            arabicFirstName: true,
            arabicLastName: true,
            email: true,
          },
        },
      });

      if (!listing) {
        throw new BadRequestException('Listing not found');
      }

      // Batch update impressions and return the listing in one go
      const newImpression = listing.impressions + 1;

      this.listingRepository
        .createQueryBuilder()
        .update()
        .set({ impressions: newImpression })
        .where('id = :id', { id: listing.id })
        .execute();

      const parsedListing = this.transformListing(listing);

      return parsedListing;
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message || error);
    }
  }

  async findOneListingForBuyer(id: string) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: id },
        relations: ['user', 'gpsCoordinate'],
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
          isListingVerified: true,
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

      this.listingRepository
        .createQueryBuilder()
        .update()
        .set({ impressions: newImpression })
        .where('id = :id', { id: listing.id })
        .execute();

      listing.deedNumber = '';

      return this.transformListing(listing);
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
        relations: ['gpsCoordinate'],
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

          isListingVerified: true,
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

      this.listingRepository
        .createQueryBuilder()
        .update()
        .set({ impressions: newImpression })
        .where('id = :id', { id: listing.id })
        .execute();

      listing.deedNumber = '';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, gpsCoordinate, places, attributes, ...partialUpdatePayload } =
        editListingDto;

      // Fetch the listing with its relations
      const listing = await this.listingRepository.findOne({
        where: { id },
        relations: ['listingAttributes', 'wishlist', 'gpsCoordinate'],
      });

      // Check permission
      // if (
      //   !(
      //     user.userType == UserProfileTypeEnum.INDIVIDUAL ||
      //     user.userType == UserProfileTypeEnum.COMPANY
      //   )
      // ) {
      //   if (listing.userId !== user.id) {
      //     throw new ForbiddenError(
      //       'This user does not have permission to update the record',
      //     );
      //   }
      // }
      if (listing.status == ListingStatus.PENDING) {
        let update;
        // Update listing details

        update = await this.listingRepository.update(id, partialUpdatePayload);

        if (gpsCoordinate) {
          update = await this.gpsCoordinateRepository.update(
            listing.gpsCoordinate.id,
            gpsCoordinate,
          );
        }

        // Create a map for quick lookups of existing attributes
        const existingAttributesMap = new Map(
          listing.listingAttributes.map((attr) => [attr.attributeId, attr]),
        );

        // Collect promises for attribute updates and new attributes
        const updatePromises = [];
        const newAttributesPromises = [];

        if (attributes?.length > 0) {
          for (const element of attributes) {
            const existingAttribute = existingAttributesMap.get(
              element.attributeId,
            );

            if (existingAttribute) {
              if (element.value !== existingAttribute.value) {
                updatePromises.push(
                  this.listingAttributesRepository.update(
                    existingAttribute.id,
                    {
                      value: element.value,
                    },
                  ),
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
        }
        // Prepare notifications
        const wishlistUserIds = listing.wishlist.map(
          (wishlist) => wishlist.userId,
        );

        // Fetch notification preference only if offer update is successful
        const notificationPreference =
          await this.notificationScopeRepository.find();
        const scope: NotificationScope = notificationPreference.find(
          (element) => {
            if (element.scopeGroup == NotificationScopeEnum.LISTING) {
              return element;
            }
          },
        );

        const images: any = JSON.parse(listing.images);
        if (partialUpdatePayload.price != undefined) {
          for (const userId of wishlistUserIds) {
            this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
              creatorId: userId,
              receiverId: listing.user.id,
              scope: scope,
              event: 'Price change',
              recipientFormat: [null, 'User that has listing in wishlist'],
              img: images[0]?.url,
              metadata: JSON.stringify(listing),
            });
          }
        }

        // Wait for all notifications to be sent

        // Return the updated listing
        if (update.affected > 0) {
          const result = await this.listingRepository.findOneOrFail({
            where: { id },
            relations: ['user', 'gpsCoordinate'],
          });

          return this.transformListing(result);
        }
      } else if (listing.status == ListingStatus.ACCEPTED) {
        let update;
        // Update listing details

        update = await this.listingRepository.update(id, {
          ...partialUpdatePayload,
          status: ListingStatus.PENDING,
        });

        if (gpsCoordinate) {
          update = await this.gpsCoordinateRepository.update(
            listing.gpsCoordinate.id,
            gpsCoordinate,
          );
        }

        // Create a map for quick lookups of existing attributes
        const existingAttributesMap = new Map(
          listing.listingAttributes.map((attr) => [attr.attributeId, attr]),
        );

        // Collect promises for attribute updates and new attributes
        const updatePromises = [];
        const newAttributesPromises = [];

        if (attributes?.length > 0) {
          for (const element of attributes) {
            const existingAttribute = existingAttributesMap.get(
              element.attributeId,
            );

            if (existingAttribute) {
              if (element.value !== existingAttribute.value) {
                updatePromises.push(
                  this.listingAttributesRepository.update(
                    existingAttribute.id,
                    {
                      value: element.value,
                    },
                  ),
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
        }
        // Prepare notifications
        const wishlistUserIds = listing.wishlist.map(
          (wishlist) => wishlist.userId,
        );
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
          const result = await this.listingRepository.findOneOrFail({
            where: { id },
            relations: ['user', 'gpsCoordinate'],
          });

          return this.transformListing(result);
        }
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
    feature: ListingImageFormDataInput,
    query: ListingImageInput,
    files: Express.Multer.File[],
  ) {
    try {
      let numberOfimagesWithinDistance = 0;
      let verified = false;

      const listing = await this.listingRepository.findOne({
        where: { id: query.listingId },
        relations: ['gpsCoordinate'],
      });

      if (!listing) {
        throw new BadRequestException('Listing not found');
      }

      if (!listing.gpsCoordinate) {
        throw new BadRequestException(
          'Listing GPS coordinates not found for listing',
        );
      }

      const results = await Promise.all(
        files.map(async (file) => await getLocationFromImage(file.buffer)),
      );

      results.forEach((element) => {
        if (element?.latitude && element?.longitude) {
          const distance = haversine(
            element.latitude,
            element.longitude,
            listing.gpsCoordinate.lat,
            listing.gpsCoordinate.lng,
          );

          if (distance * 1000 < 500) {
            numberOfimagesWithinDistance++;
          }
        }
      });

      if (numberOfimagesWithinDistance === files.length) {
        verified = true;
      }

      const existingImages: any[] = listing.images
        ? JSON.parse(listing.images)
        : [];

      const uploadPromises = files.map((file) =>
        this.storageService.upload(file),
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      if (query.imageId) {
        if (files.length > 1) {
          throw new BadRequestException(
            'Only one file can be uploaded when updating an existing image',
          );
        }

        if (!uploadedUrls.length) {
          throw new BadRequestException('File upload failed');
        }

        const imageIndex = existingImages.findIndex(
          (image) => image.id === query.imageId,
        );

        if (imageIndex > -1) {
          // This will work correctly even if imageIndex is 0
          existingImages[imageIndex].url = uploadedUrls[0];
          existingImages[imageIndex].isFeatured = feature.feature;
          existingImages[imageIndex].isPanorama = false;

          existingImages[imageIndex].isDeleted = false;
        } else {
          throw new BadRequestException('Image ID not found');
        }
      } else {
        const newImages = uploadedUrls.map((url, index) => ({
          id: (existingImages.length + index).toString(),
          url,
          isFeatured: feature.feature,
          isDeleted: false,
          isPanorama: false,
          verified,
        }));
        existingImages.push(...newImages);
      }

      const stringifiedImages = JSON.stringify(existingImages);

      await this.listingRepository.update(query.listingId, {
        publishable: true,
        images: stringifiedImages,
        isListingVerified: verified,
      });

      if (!listing.images) {
        const notificationPreference =
          await this.notificationScopeRepository.find();
        const scope: NotificationScope = notificationPreference.find(
          (element) => {
            if (element.scopeGroup == NotificationScopeEnum.LISTING) {
              return element;
            }
          },
        );

        const role = await this.roleRepository.find({
          where: {
            permissions: {
              slug: PermissionsEnum.LISTINGS_CREATE,
            },
          },
          relations: ['permissions', 'user'], // Ensures the relationship is loaded if not already eager
        });

        const users = role
          .flatMap((element) => element.user)
          .filter(
            (user, index, self) =>
              self.findIndex((u) => u.id === user.id) === index,
          );

        const images = JSON.parse(stringifiedImages);
        users.forEach((user) => {
          console.log(user.id);
          this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
            recipientId: user.id,
            scope: scope,
            event: 'Create',
            metadata: JSON.stringify(listing),
            recipientFormat: [null, 'Admin listing approver'],
            img: images[0]?.url,
          });
        });
      }
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

  async uploadPanoramaImage(
    id: string,
    files: Express.Multer.File[],
    imageId: string,
    feature: ListingImageFormDataInput,
  ) {
    try {
      let numberOfimagesWithinDistance: number;
      const verified = false;

      const listing = await this.listingRepository.findOne({ where: { id } });

      if (!listing) {
        throw new BadRequestException('Listing not found');
      }

      const existingImages: any[] = listing.images
        ? JSON.parse(listing.images)
        : [];

      // Upload the new files
      const uploadPromises = files.map((file) =>
        this.storageService.upload(file),
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      const results = await Promise.all(
        files.map(async (file) => await getLocationFromImage(file.buffer)),
      );
      results.forEach((element) => {
        const distance = haversine(
          element?.latitude,
          element?.longitude,
          listing.gpsCoordinate?.lat,
          listing.gpsCoordinate?.lng,
        );

        if (distance * 1000 < 500) {
          numberOfimagesWithinDistance = numberOfimagesWithinDistance + 1;
        }
      });

      if (imageId) {
        // Update existing image
        let imageUpdated = false;
        existingImages.map((image, index) => {
          if (image.id == imageId) {
            existingImages[index].url = uploadedUrls[0]; // Assuming single file upload
            imageUpdated = true;
            existingImages[index].isFeatured = feature.feature;
            existingImages[index].isDeleted = false;
            existingImages[index].isPanorama = true;
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
          isDeleted: false,
          isPanorama: true,
          verified: verified,
          isFeature: feature.feature,
        }));

        existingImages.push(...newImages);
      }

      // Stringify the updated images array for storage
      const stringifiedImages = JSON.stringify(existingImages);

      // Save the updated images to the database
      await this.listingRepository.update(id, {
        publishable: true,

        images: stringifiedImages,
        isListingVerified: verified,
      });
      return new SuccessResponse(AppStrings.UPLOAD_SUCCESSFUL, existingImages);
    } catch (error) {
      this.logger.error('Error during panorama image upload', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(
          error.message || 'An unexpected error occurred during image upload',
        );
      }
    }
  }

  async createPromotion(createPromotionInput: CreatePromotionInput) {
    try {
      const [listing, adPackage, currentPromotion] = await Promise.all([
        this.listingRepository.findOne({
          where: { id: createPromotionInput.listingId },
        }),
        this.adpackageService.findOne(createPromotionInput.adPackageId),

        this.promotionRepository.find({
          where: { expiredAt: MoreThan(new Date()) },
        }),
      ]);

      if (!adPackage) {
        throw new BadRequestException('Invalid Ad Package ');
      }

      if (!adPackage && !listing) {
        throw new BadRequestException('Invalid listing ');
      }
      if (currentPromotion.length > 0) {
        throw new BadRequestException('A promotion is currently running');
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
          bundleType: adPackage.name,
          promotionPrice: adPackage.price,
          bundleImpression: adPackage.impression,
        });
        return promotion;
      }
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  async stopPromotion(id: string, user: User) {
    try {
      const listing = await this.listingRepository.findOneBy({ id });

      if (!listing) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      if (user.id != listing.userId) {
        throw new BadRequestException(
          'Only the user of this listing can stop promotion',
        );
      }
      const { affected } = await this.listingRepository.update(id, {
        isListingPromoted: false,
        promotedDate: null,
        promotionExpiration: null,
        promotionPrice: null,
        bundleImpression: null,
        bundleType: null,
      });

      if (affected > 0) {
        return new SuccessResponse();
      }
      throw new UnprocessableEntityException();
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error);
      }
    }
  }

  async flagListing(flaglistingInput: FlagListingInput, userId: string) {
    try {
      const listing = await this.listingRepository.findOneOrFail({
        where: { id: flaglistingInput.listingId },
      });
      const childIssue = await this.childIssueRepository.findOneByOrFail({
        id: flaglistingInput.childIssueId,
      });

      if (!childIssue) {
        throw new BadRequestException(`ChildIssue ${AppStrings.NOT_FOUND}`);
      }

      const parentIssue = await this.issueRepository.findOneByOrFail({
        id: flaglistingInput.parentIssueId,
      });

      if (!parentIssue) {
        throw new BadRequestException(`parentIssue ${AppStrings.NOT_FOUND}`);
      }

      if (!listing) {
        throw new BadRequestException(AppStrings.LISTING_NOT_FOUND);
      } else {
        await this.flagListingRepository.save({
          parentIssue,
          childIssue,
          listing,
          userId,
        });

        const date = new Date();

        await this.listingRepository.update(listing.id, {
          isListingFlagged: true,
          flaggedDate: date,
        });

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
      const whereOption =
        paginateAndSort?.where?.fieldToChose &&
        paginateAndSort?.where?.whereParam
          ? {
              [paginateAndSort.where.fieldToChose]:
                paginateAndSort.where.whereParam,
            }
          : {};
      const orderOptions = {
        [paginateAndSort.sortField]: paginateAndSort.directionToSort,
      };
      if (paginateAndSort.take && paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }
      const [flaggedListing, total] =
        await this.flagListingRepository.findAndCount({
          where: { ...whereOption },
          take: paginateAndSort.take,
          skip: paginateAndSort.skip,
          order: orderOptions,
          relations: ['childIssue'],
        });

      return { flaggedListing, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async flaggedListing(id: string) {
    try {
      const flaggedListing = await this.flagListingRepository.findOne({
        where: {
          listing: { id: id },
        },
        relations: ['reporter', 'childIssue'],
      });
      if (!flaggedListing) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      return flaggedListing;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error?.messages || error.data);
      }
    }
  }

  async disableListing(listingActionInput: ListingActionInput) {
    try {
      await this.listingRepository.update(
        { id: In(listingActionInput.listingId) },
        {
          isListingDisabled: true,
        },
      );

      return new SuccessResponse(AppStrings.LISTING_DISABLE_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async unPublishListing(listingId: string, user: User) {
    try {
      const listing = await this.listingRepository.findOneByOrFail({
        id: listingId,
      });
      if (listing.userId != user.id) {
        throw new BadRequestException('Only the owner can unpublish listing');
      }

      if (!listing) {
        throw new BadRequestException(AppStrings.LISTING_NOT_FOUND);
      }

      await this.listingRepository.update(listing.id, {
        published: false,
      });

      return new SuccessResponse(AppStrings.LISTING_UNPUBLISHED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async publishListing(listingId: string, user: User) {
    try {
      const listing = await this.listingRepository.findOneByOrFail({
        id: listingId,
      });
      if (listing.userId != user.id) {
        throw new BadRequestException('Only the owner can publish listing');
      }
      if (
        listing.status == ListingStatus.PENDING ||
        listing.status == ListingStatus.REJECTED
      ) {
        throw new BadRequestException(' Listing is not approved by Admin');
      }

      if (!listing) {
        throw new BadRequestException(AppStrings.LISTING_NOT_FOUND);
      }

      await this.listingRepository.update(listing.id, {
        published: true,
      });

      return new SuccessResponse(AppStrings.LISTING_UNPUBLISHED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async enableListing(listingActionInput: ListingActionInput, admin: User) {
    try {
      const listing = await this.listingRepository.find({
        where: { id: In(listingActionInput.listingId) },
      });
      await this.listingRepository.update(
        { id: In(listingActionInput.listingId) },
        {
          isListingDisabled: false,
        },
      );

      const activityToSave = listing.map((element) => {
        return {
          adminId: admin.id,
          action: ActivityEnum.ENABLED,
          details: JSON.stringify(listing.find((a) => a.id === element.id)),

          listingId: element.id,
        };
      });

      await this.activityLogsService.logActivity(activityToSave);

      return new SuccessResponse(AppStrings.LISTING_ENABLED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.messages | error.data);
    }
  }

  async approveListing(
    listingActionInput: ListingActionApprovalInput,
    admin: User,
  ) {
    try {
      // Extract listing IDs from input
      const listingIds = listingActionInput.listingApproval.map(
        (item) => item.id,
      );

      // Fetch listings from the database
      const listings = await this.listingRepository.find({
        where: { id: In(listingIds) },
      });

      if (!listings || listings.length === 0) {
        throw new BadRequestException('No matching listings found.');
      }

      // Prepare updates for listings
      const updatedListings = listings.map((listing) => {
        if (!listing || !listing.id) {
          throw new BadRequestException('Invalid listing data.');
        }

        const approvalData = listingActionInput.listingApproval.find(
          (item) => item.id === listing.id,
        );

        if (!approvalData) {
          throw new BadRequestException(
            `Approval data missing for listing ID: ${listing.id}`,
          );
        }

        return {
          ...listing,
          reason: approvalData.reason,
          status: ListingStatus.ACCEPTED,
        };
      });
      let updatedListingId = [];

      // Save updated listings
      const listing = await this.listingRepository.save(updatedListings);
      listing.forEach((element) => {
        updatedListingId.push(element.id);
      });

      const data = await this.listingRepository.find({
        where: { id: In(updatedListingId) },
        relations: ['user'],
      });

      // Fetch notification scope
      const scope = await this.notificationScopeRepository.findOne({
        where: { scopeGroup: NotificationScopeEnum.LISTING },
      });
      // Send notifications
      data.forEach((element) => {
        const image = JSON.parse(element.images);

        this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
          creatorId: element.user.id,
          scope: scope,
          category: scope.name,
          metadata: JSON.stringify(listing),
          event: 'Approved',
          recipientFormat: ['Owner', null],
          img: image[0]?.url,
        });
      });

      // Log activities
      const activities = updatedListings.map((listing) => ({
        adminId: admin.id,
        action: ActivityEnum.APPROVED,
        details: JSON.stringify(listing),
        listingId: listing.id,
      }));

      await this.activityLogsService.logActivity(activities);

      return new SuccessResponse(AppStrings.LISTING_APPROVED_SUCCESSFULLY);
    } catch (error) {
      this.logger.error('Error approving listings:', error.stack);
      throw new BadRequestException(
        error?.message || 'An error occurred during approval.',
      );
    }
  }

  async rejectListing(
    listingActionInput: ListingActionApprovalInput,
    admin: User,
  ) {
    try {
      const listingId = [];
      listingActionInput.listingApproval.forEach((element) => {
        listingId.push(element.id);
      });
      const listing = await this.listingRepository.find({
        where: { id: In(listingId) },
      });

      const resultToUpdate = listing.map((element) => {
        const listingToUpdate = listingActionInput.listingApproval.find(
          (value) => element.id == value.id,
        );
        return {
          ...element,
          reason: listingToUpdate.reason,

          status: ListingStatus.REJECTED,
        };
      });

      await this.listingRepository.save(resultToUpdate);

      const notificationPreference =
        await this.notificationScopeRepository.find();
      const scope: NotificationScope = notificationPreference.find(
        (element) => {
          if (element.scopeGroup == NotificationScopeEnum.LISTING) {
            return element;
          }
        },
      );

      listing.forEach((element) => {
        const images = JSON.parse(element.images);
        this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
          creatorId: element.userId,
          event: 'Denied',
          metadata: JSON.stringify(listing),

          scope: scope,
          recipientFormat: ['Owner', null],
          img: images[0]?.url,
        });
      });

      const activityToSave = listing.map((element) => {
        return {
          adminId: admin.id,
          action: ActivityEnum.REJECTED,
          details: JSON.stringify(listing.find((a) => a.id === element.id)),

          listingId: element.id,
        };
      });

      await this.activityLogsService.logActivity(activityToSave);

      return new SuccessResponse(AppStrings.LISTING_REJECTED_SUCCESSFULLY);
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async getSearchHistory(id: string, paginateAndSort?: PaginateAndSort) {
    try {
      // Ensure the sorting direction and field are properly set
      const sortField = paginateAndSort?.sortField || 'createdAt'; // default to createdAt if not provided
      const directionToSort = paginateAndSort?.directionToSort || 'ASC'; // default to ascending

      const sortDirections = ['ASC', 'DESC'] as const;

      if (paginateAndSort.take && paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }

      // Using query builder
      const queryBuilder =
        this.searchHistoryRepository.createQueryBuilder('searchHistory');

      // Building the query with conditions
      const query = queryBuilder
        .where('searchHistory.userId = :id', { id })
        .orderBy(
          `searchHistory.${sortField}`,
          directionToSort.toUpperCase() as (typeof sortDirections)[number],
          'NULLS LAST',
        ) // Correct orderBy usage
        .skip(paginateAndSort.skip)
        .take(paginateAndSort.take);

      // Getting the search history results
      const searchHistory = await query.getMany();

      // Getting the total count of records
      const total = await query.getCount();

      return { searchHistory, total };
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async featureAListing(createFeatureInput: CreateFeatureInput, admin: User) {
    try {
      let featured: Feature;
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
        const currentPromotion = await this.promotionRepository.find({
          where: {
            expiredAt: LessThan(new Date()),
          },
        });

        if (currentPromotion.length > 0) {
          throw new BadRequestException('A promotion is currently running');
        }
        featured = await this.featureRepository.save({
          ...createFeatureInput,
          adPackage: { ...adPackage },
          listing: { ...listing },
        });

        await this.listingRepository.update(listing.id, {
          featureExpiration: createFeatureInput.endDate,
          isListingFeatured: true,
          featureDate: createFeatureInput.startDate,
          bundleType: adPackage.name,
          bundleImpression: adPackage.impression,
        });
      }

      await this.activityLogsService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.FEATURED,
          details: JSON.stringify(listing),
          listingId: listing.id,
        },
      ]);

      return featured;
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async unfeatureAListing(id: string, admin: User) {
    try {
      const listing = await this.listingRepository.findOneBy({
        id,
      });

      if (!listing.isListingFeatured) {
        throw new BadRequestException('Listing is not Featured');
      }

      if (!listing) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const { affected } = await this.listingRepository.update(listing.id, {
        isListingFeatured: false,
        featureDate: null,
        featureExpiration: null,
      });

      await this.activityLogsService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.UN_FEATURED,
          details: JSON.stringify(listing),
          listingId: listing.id,
        },
      ]);

      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException(error);
    }
  }

  /**
   * Search history
   */

  async saveSearchHistory(
    searchHistory: Partial<CreateSearchHistoryInput>,
    user: User,
  ) {
    let isValid = false;
    let attributes = [];
    let attributeList: Attribute[];

    if (searchHistory.attributes) {
      attributeList = await this.attributeRepository.find({
        where: { id: In(searchHistory.attributes.map((a) => a.attributeId)) },
      });

      const attributeMap = new Map(
        attributeList.map((attr) => [attr.id, attr]),
      );

      attributes = searchHistory.attributes
        .map((element) => {
          const foundAttribute = attributeMap.get(element.attributeId);

          if (foundAttribute) {
            return {
              id: foundAttribute.id,
              englishName: foundAttribute.englishName,
              arabicName: foundAttribute.arabicName,
              value: element.value,
            };
          }
          return null; // Or throw an error if all attributes should be found
        })
        .filter((attr) => attr !== null);
    }
    //If attribute is found then the search is a valid search
    if (attributes?.length == attributeList?.length) {
      isValid = true;
    }
    const type = await this.listingTypeService.findOne(
      searchHistory.listingTypeId,
    );

    await this.searchHistoryRepository.save({
      attributes: JSON.stringify(attributes),
      purpose: searchHistory.purpose,
      gpsCoordinate: JSON.stringify(searchHistory.gpsCoordinate),
      minPrice: searchHistory.minPrice,
      maxPrice: searchHistory.maxPrice,
      minArea: searchHistory.minArea,
      maxArea: searchHistory.maxArea,
      type: JSON.stringify(type),
      rentingOption: searchHistory.rentingOption,
      user: user,
      isValid: isValid,
    });
  }

  async deleteSavedHistory(id: string) {
    try {
      const searchHistory = await this.searchHistoryRepository.findOneByOrFail({
        id,
      });

      if (!searchHistory) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      const { affected } = await this.searchHistoryRepository.softDelete(
        searchHistory.id,
      );
      if (affected) {
        return new SuccessResponse(AppStrings.LISTING_DELETED_SUCCESSFULLY);
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
  async deleteListingImage(listingId: string, imageIds: string[]) {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id: listingId },
      });

      if (!listing) {
        throw new BadRequestException('Listing not found');
      }

      let existingImages: any[];
      try {
        existingImages = listing.images ? JSON.parse(listing.images) : [];
      } catch (error) {
        throw new BadRequestException('Invalid image data');
      }

      const updatedImages = existingImages.map((image) => {
        // If specific image IDs are provided, delete only those; otherwise, delete all
        if (!imageIds.length || imageIds.includes(image.id)) {
          image.isDeleted = true; // Mark the image as deleted
        }
        return image;
      });

      // Convert the updated images back to a JSON string
      const stringifiedImages = JSON.stringify(updatedImages);

      // Update the listing with the modified images array
      await this.listingRepository.update(listingId, {
        images: stringifiedImages,
      });

      return new SuccessResponse(
        AppStrings.DELETED_SUCCESSFULLY,
        updatedImages,
      );
    } catch (error) {
      this.logger.error(error.message || error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException(error.message || 'An error occurred');
    }
  }

  async searchForListing(searchParam: string) {
    try {
      return await this.listingRepository
        .createQueryBuilder('listing')
        .leftJoinAndSelect('listing.user', 'user')
        .leftJoinAndSelect('listing.listingType', 'listingType')

        .where('listing.title ILIKE :term', { term: `%${searchParam}%` })
        .orWhere('user.lastName ILIKE :term', { term: `%${searchParam}%` })
        .orWhere('user.firstName ILIKE :term', { term: `%${searchParam}%` })

        .orWhere('listingType.englishName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('listingType.arabicName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .take(10)
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  transformListing(listing: Listing): Listing {
    try {
      let { images, ...rest } = listing;

      // If `images` is undefined or null, default to an empty array
      let parsedImages: any[] | string = images ?? [];

      // Attempt to parse `images` only if it's a valid JSON string
      if (typeof images === 'string' && isJsonString(images)) {
        try {
          parsedImages = JSON.parse(images);
        } catch (parseError) {
          this.logger.log('Failed to parse images JSON:', parseError);
        }
      }

      // Filter images if parsedImages is an array
      const filteredImages = Array.isArray(parsedImages)
        ? filterDeletedImages(parsedImages)
        : parsedImages;

      // Return transformed listing
      return {
        ...rest,
        images: JSON.stringify(filteredImages),
      };
    } catch (error) {
      this.logger.error('Error transforming listing:', error);

      // Return the original listing with `images` defaulting to an empty string
      return {
        ...listing,
        images: listing?.images ?? '',
      };
    }
  }

  // Helper function to check if a string is valid JSON

  async compareListings(compareListingInput: CompareListingInput, user: User) {
    try {
      const [listings, attributes] = await Promise.all([
        this.listingRepository
          .createQueryBuilder('listing')
          .where('listing.id IN (:...listingIds)', {
            listingIds: compareListingInput.id,
          })
          .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')

          .leftJoinAndSelect('listingAttributes.attribute', 'attribute')

          .leftJoinAndSelect('listing.listingType', 'listingType')

          .getMany(),
        this.attributeRepository.find({ where: { showInComparison: true } }),
      ]);

      if (listings.length == 0) {
        throw new BadRequestException(AppStrings.LISTING_NOT_FOUND);
      }

      const transformListing = listings.map((listing) => {
        const { listingAttributes, ...rest } = listing;

        const filteredAttributes = listingAttributes.filter((attr) =>
          attributes.some((compAttr) => compAttr.id === attr.attributeId),
        );

        return {
          ...rest,
          listingAttributes: filteredAttributes,
        };
      });

      const data = await this.compareRepository.findOne({
        where: { userId: user.id },
      });
      if (data) {
        await this.compareRepository.update(data.id, {
          user,
          listings: compareListingInput.id,
        });
      } else {
        await this.compareRepository.save({
          user,
          listings: compareListingInput.id,
        });
      }
      return transformListing;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async fetchCompare(user: User) {
    try {
      return await this.compareRepository.findOne({
        where: { userId: user.id },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
