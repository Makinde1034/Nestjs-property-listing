/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AttributeSetRepository, ListingTypeRepository } from '../repositories';
import { ListingType, User } from 'src/entities';
import {
  ListingTypeDeleteInput,
  ListingTypeInput,
  ListingTypeUpdateInput,
} from '../dtos/request';
import { In } from 'typeorm';
import { AppStrings } from 'src/common/messages/app.strings';
import { StorageService } from '../../file-handler/services/storage.service';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { ActivityEnum } from '../../../common/enums/activitys';

@Injectable()
export class ListingTypeService {
  constructor(
    private readonly listingTypeRepository: ListingTypeRepository,
    private readonly attributeSetRepository: AttributeSetRepository,
    private readonly storageService: StorageService,
    private readonly activityLogService: ActivityLogService,
  ) {}
  logger = new Logger(ListingTypeService.name);
  async findOne(id: string) {
    try {
      const listingType = await this.listingTypeRepository.findByIdOrFail(id, [
        'attributeSets',
      ]);

      return listingType;
    } catch (error) {
      throw new BadRequestException(AppStrings.LISTING_TYPE_NOT_FOUND);
    }
  }

  /**
   * List Listing Types
   *
   * @async
   * @returns {Promise<ListingTypesResponse>}
   */
  async findAllListingTypes(findOptions: PaginateAndSort) {
    const [listingType, total] = await this.listingTypeRepository.findAndCount({
      take: findOptions.take,
      skip: findOptions.skip,
      relations: ['attributeSets'],
    });
    return { listingType, total };
  }

  /**
   * Create ListingType
   *
   * @async
   * @param {ListingTypeInput} input
   * @param {Express.Multer.File?} icon
   * @returns {Promise<ListingType>}
   */
  async createListingType(
    input: ListingTypeInput,
    admin: User,

    icon?: Express.Multer.File,
  ): Promise<ListingType> {
    const attributeSets = await this.attributeSetRepository.findAll({
      where: { id: In([...input.attributeSets]) },
    });

    const data: Partial<ListingType> = {
      englishName: input.englishName,
      arabicName: input.arabicName,
      attributeSets,
    };
    if (icon) {
      // Upload icon image
      const imageurl = await this.storageService.upload(icon);
      data.icon = imageurl;
    }
    const listingType = await this.listingTypeRepository.create(data);
    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.CREATED,
        listingTypeId: listingType.id,
        details: JSON.stringify(listingType),
      },
    ]);

    return listingType;
  }

  /**
   * Update ListingType
   *
   * @async
   * @param {ListingTypeUpdateInput} input
   * @param {Express.Multer.File?} icon
   * @returns {Promise<ListingType>}
   */
  async updateListingType(
    input: ListingTypeUpdateInput,
    admin: User,
  ): Promise<ListingType> {
    const { attributeSets, ...rest } = input;

    if (attributeSets) {
      const attributeSetsPayload = await this.attributeSetRepository.findAll({
        where: { id: In([...input.attributeSets]) },
      });
      const listingType = await this.listingTypeRepository.update(input.id, {
        ...rest,
        attributeSets: attributeSetsPayload,
      });

      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          listingTypeId: listingType.id,
          details: JSON.stringify(listingType),
        },
      ]);
      return listingType;
    }

    const listingType = await this.listingTypeRepository.update(input.id, {
      ...rest,
    });
    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.UPDATED,
        listingTypeId: listingType.id,
        details: JSON.stringify(listingType),
      },
    ]);

    return listingType;
  }

  /**
   * Delete ListingType
   *
   * @async
   * @param {ListingTypeDeleteInput} data
   * @returns {Promise<string>}
   */
  async deleteListingType(
    data: ListingTypeDeleteInput,
    admin: User,
  ): Promise<string> {
    await this.listingTypeRepository.softDelete(data.id);

    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.DELETED,
        listingTypeId: data.id,
      },
    ]);
    return AppStrings.LISTINGTYPE_DELETED_SUCCESSFULLY;
  }

  async updateListingTypeIcon(
    id: string,
    admin: User,
    icon?: Express.Multer.File,
  ): Promise<ListingType> {
    const listingType = await this.listingTypeRepository.findOne({
      where: { id: id },
    });
    let result: ListingType;
    if (!listingType) {
      throw new BadRequestException(AppStrings.LISTING_TYPE_NOT_FOUND);
    }

    if (icon) {
      // Upload icon image
      const imageurl = await this.storageService.upload(icon);
      result = await this.listingTypeRepository.update(id, { icon: imageurl });
    }

    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.UPDATED,
        listingTypeId: listingType.id,
        details: JSON.stringify(result),
      },
    ]);

    return result;
  }

  async searchForListingType(searchParam: string) {
    try {
      return await this.listingTypeRepository
        .queryBuilder('listingType')

        .where('listingType.englishName ILIKE :term', {
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
}
