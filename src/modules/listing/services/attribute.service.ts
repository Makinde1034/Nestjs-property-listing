/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { AttributeSetRepository } from '../repositories/attribute-set.repository';
import { AttributeRepository } from '../repositories';
import { Attribute, AttributeSet } from 'src/entities';
import {
  AttributeInput,
  AttributeSetInput,
  AttributeSetUpdateInput,
  AttributeUpdateInput,
  AttributeDeleteInput,
} from '../dtos/request';
import { In } from 'typeorm';
import { AppStrings } from 'src/common/messages/app.strings';
import { StorageService } from '../../file-handler/services/storage.service';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Injectable()
export class AttributeService {
  constructor(
    private readonly attributeRepository: AttributeRepository,
    private readonly attributeSetRepository: AttributeSetRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOne(id: string) {
    return await this.attributeRepository.findOneOrFail({ where: { id: id } });
  }

  /**
   * List Attributes
   *
   * @async
   * @returns {Promise<Attribute[]>}
   */
  async findAllAttributes(findOptions: PaginateAndSort): Promise<Attribute[]> {
    let whereOption = {};
    const { where } = findOptions;

    if (where) {
      whereOption = { [where.fieldToChose]: where.whereParam };
    }

    return await this.attributeRepository.find({ where: whereOption });
  }

  /**
   * Create Attribute
   *
   * @async
   * @param {AttributeInput} data
   * @returns {Promise<Attribute>}
   */
  async createAttribute(
    data: AttributeInput,
    icon?: Express.Multer.File,
  ): Promise<Attribute> {
    const attributeData: Partial<Attribute> = {
      ...data,
    };
    if (icon) {
      // Upload icon image
      const imageurl = await this.storageService.upload(icon);
      attributeData.icon = imageurl;
    }
    return this.attributeRepository.create(attributeData);
  }

  async uploadAttributeIcon(
    id: string,
    icon?: Express.Multer.File,
  ): Promise<Attribute> {
    let imageurl;
    if (icon) {
      // Upload icon image
      imageurl = await this.storageService.upload(icon);
    }
    const update = await this.attributeRepository.update(id, {
      icon: imageurl,
    });
    if (update.affected > 0) {
      return this.attributeRepository.findOneOrFail({ where: { id: id } });
    }
  }

  /**
   * Update Attribute
   *
   * @async
   * @param {AttributeUpdateInput} data
   * @param {Express.Multer.File?} icon
   * @returns {Promise<Attribute>}
   */
  async updateAttribute(
    data: AttributeUpdateInput,
    icon?: Express.Multer.File,
  ): Promise<Attribute> {
    const attributeData: Partial<Attribute> = {
      ...data,
    };
    if (icon) {
      // Upload icon image
      const imageurl = await this.storageService.upload(icon);
      attributeData.icon = imageurl;

      const update = await this.attributeRepository.update(
        data.id,
        attributeData,
      );
      if (update.affected > 0) {
        return this.attributeRepository.findOneOrFail({
          where: { id: data.id },
        });
      }
    }
  }

  /**
   * Delete Attribute
   *
   * @async
   * @param {AttributeDeleteInput} data
   * @returns {Promise<string>}
   */
  async deleteAttribute(data: AttributeDeleteInput): Promise<string> {
    const attribute = await this.attributeRepository.findOneOrFail({
      where: { id: data.id },
      relations: ['attributeSets'],
    });
    if (attribute.attributeSets && attribute.attributeSets.length > 0) {
      throw new BadRequestException(AppStrings.UNABLE_TO_DELETE_ATTRIBUTE);
    }
    await this.attributeRepository.delete(data.id);
    return AppStrings.ATTRIBUTE_DELETED_SUCCESSFULLY;
  }

  /**
   * List AttributeSets
   *
   * @async
   * @returns {Promise<AttributeSet[]>}
   */
  async findAllAttributeSets(): Promise<AttributeSet[]> {
    return await this.attributeSetRepository.findAll();
  }

  /**
   * Create AttributeSet
   *
   * @async
   * @param {AttributeSetInput} input
   * @returns {Promise<AttributeSet>}
   */
  async createAttributeSet(input: AttributeSetInput): Promise<AttributeSet> {
    const attributes = await this.attributeRepository.find({
      where: { id: In([...input.attributes]) },
    });
    const data: Partial<AttributeSet> = {
      englishName: input.englishName,
      arabicName: input.arabicName,
      attributes,
    };
    return await this.attributeSetRepository.create(data);
  }

  /**
   * Update AttributeSet
   *
   * @async
   * @param {AttributeSetUpdateInput} input
   * @returns {Promise<AttributeSet>}
   */
  async updateAttributeSet(
    input: AttributeSetUpdateInput,
  ): Promise<AttributeSet> {
    const attributes = await this.attributeRepository.find({
      where: { id: In([...input.attributes]) },
    });
    const data: Partial<AttributeSet> = {
      englishName: input.englishName,
      arabicName: input.arabicName,
      attributes,
    };
    return await this.attributeSetRepository.update(input.id, data);
  }

  /**
   * Delete AttributeSets
   *
   * @async
   * @param {AttributeDeleteInput} data
   * @returns {Promise<string>}
   */
  async deleteAttributeSet(data: AttributeDeleteInput): Promise<string> {
    await this.attributeSetRepository.delete(data.id);
    return AppStrings.ATTRIBUTESET_DELETED_SUCCESSFULLY;
  }
}
