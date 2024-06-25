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

@Injectable()
export class AttributeService {
  constructor(
    private readonly attributeRepository: AttributeRepository,
    private readonly attributeSetRepository: AttributeSetRepository,
    private readonly storageService: StorageService,
  ) {}

  /**
   * List Attributes
   *
   * @async
   * @returns {Promise<Attribute[]>}
   */
  async findAllAttributes(): Promise<Attribute[]> {
    return await this.attributeRepository.findAll();
  }

  /**
   * Create Attribute
   *
   * @async
   * @param {AttributeInput} data
   * @param {Express.Multer.File?} icon
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
    return await this.attributeRepository.create(attributeData);
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
    }
    return await this.attributeRepository.update(data.id, attributeData);
  }

  /**
   * Delete Attribute
   *
   * @async
   * @param {AttributeDeleteInput} data
   * @returns {Promise<string>}
   */
  async deleteAttribute(data: AttributeDeleteInput): Promise<string> {
    const attribute = await this.attributeRepository.findByIdOrFail(data.id, [
      'attributeSets',
    ]);
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
    const attributes = await this.attributeRepository.findAll({
      where: { id: In([...input.attributes]) },
    });
    const data: Partial<AttributeSet> = {
      name: input.name,
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
    const attributes = await this.attributeRepository.findAll({
      where: { id: In([...input.attributes]) },
    });
    const data: Partial<AttributeSet> = {
      name: input.name,
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
