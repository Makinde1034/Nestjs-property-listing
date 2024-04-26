/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { AttributeSetRepository, ListingTypeRepository } from '../repositories';
import { ListingType } from 'src/entities';
import {
  ListingTypeDeleteInput,
  ListingTypeInput,
  ListingTypeUpdateInput,
} from '../dtos';
import { In } from 'typeorm';
import { AppStrings } from 'src/common/messages/app.strings';

@Injectable()
export class ListingTypeService {
  constructor(
    private readonly listingTypeRepository: ListingTypeRepository,
    private readonly attributeSetRepository: AttributeSetRepository,
  ) {}

  /**
   * List Listing Types
   *
   * @async
   * @returns {Promise<ListingType[]>}
   */
  async findAllListingTypes(): Promise<ListingType[]> {
    return await this.listingTypeRepository.findAll();
  }

  /**
   * Create ListingType
   *
   * @async
   * @param {ListingTypeInput} input
   * @returns {Promise<ListingType>}
   */
  async createListingType(input: ListingTypeInput): Promise<ListingType> {
    const attributeSets = await this.attributeSetRepository.findAll({
      where: { id: In([...input.attributeSets]) },
    });
    const data: Partial<ListingType> = {
      name: input.name,
      attributeSets,
    };
    return await this.listingTypeRepository.create(data);
  }

  /**
   * Update ListingType
   *
   * @async
   * @param {ListingTypeUpdateInput} input
   * @returns {Promise<ListingType>}
   */
  async updateListingType(input: ListingTypeUpdateInput): Promise<ListingType> {
    const attributeSets = await this.attributeSetRepository.findAll({
      where: { id: In([...input.attributeSets]) },
    });
    const data: Partial<ListingType> = {
      name: input.name,
      attributeSets,
    };
    return await this.listingTypeRepository.update(input.id, data);
  }

  /**
   * Delete ListingType
   *
   * @async
   * @param {ListingTypeDeleteInput} data
   * @returns {Promise<string>}
   */
  async deleteListingType(data: ListingTypeDeleteInput): Promise<string> {
    await this.listingTypeRepository.delete(data.id);
    return AppStrings.LISTINGTYPE_DELETED_SUCCESSFULLY;
  }
}
