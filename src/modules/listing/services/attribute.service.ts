/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { AttributeFilter } from '../dtos/request/attributes.dto';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Injectable()
export class AttributeService {
  constructor(
    private readonly attributeRepository: AttributeRepository,
    private readonly attributeSetRepository: AttributeSetRepository,
    private readonly storageService: StorageService,
  ) {}
  logger = new Logger(AttributeService.name);
  async findOneAttribute(id: string) {
    try {
      return await this.attributeRepository.findOneOrFail({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(AppStrings.ATTRIBUTE_NOT_FOUND);
    }
  }

  /**
   * List Attributes
   *
   * @async
   * @returns {Promise<Attribute[]>}
   */
  async findAllAttributes(findOptions: AttributeFilter) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { where, skip, take, directionToSort, sortField, ...rest } =
      findOptions;

    const [attribute, total] = await this.attributeRepository.findAndCount({
      where: { ...rest },
      take,
      skip,
    });

    return { attribute, total };
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
    try {
      const attributeData: Partial<Attribute> = {
        ...data,
      };
      if (icon) {
        // Upload icon image
        const imageurl = await this.storageService.upload(icon);
        attributeData.icon = imageurl;
      }
      return await this.attributeRepository.save(attributeData);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async uploadAttributeIcon(
    id: string,
    icon?: Express.Multer.File,
  ): Promise<Attribute> {
    try {
      let imageUrl: string;
      const attribute = await this.attributeRepository.findOneBy({ id });

      if (!attribute) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      if (icon) {
        // Upload icon image only if provided
        imageUrl = await this.storageService.upload(icon);
      }

      // Perform update only if the image URL exists
      if (imageUrl) {
        const { affected } = await this.attributeRepository.update(
          attribute.id,
          {
            icon: imageUrl,
          },
        );

        // Fetch updated entity only if update was successful
        if (affected > 0) {
          return this.attributeRepository.findOneOrFail({
            where: { id: attribute.id },
          });
        }
      }

      return attribute;
    } catch (error) {
      this.logger.error('Error uploading attribute icon:', error);
      throw new BadRequestException(
        error.message || 'Failed to upload attribute icon',
      );
    }
  }

  async deleteAttributeIcon(id: string): Promise<Attribute> {
    try {
      const attribute = await this.attributeRepository.findOneBy({ id });

      if (!attribute) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      const { affected } = await this.attributeRepository.update(attribute.id, {
        icon: null,
      });

      // Fetch updated entity only if update was successful
      if (affected > 0) {
        return this.attributeRepository.findOneOrFail({
          where: { id: attribute.id },
        });
      }
    } catch (error) {
      this.logger.error('Error uploading attribute icon:', error);
      throw new BadRequestException(
        error.message || 'Failed to upload attribute icon',
      );
    }
  }

  async deleteAttributeSetIcon(id: string): Promise<AttributeSet> {
    try {
      const attributeSet = await this.attributeSetRepository.findByIdOrFail(id);

      if (!attributeSet) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      const { affected } = await this.attributeRepository.update(
        attributeSet.id,
        {
          icon: null,
        },
      );

      // Fetch updated entity only if update was successful
      if (affected > 0) {
        return await this.attributeSetRepository.findByIdOrFail(
          attributeSet.id,
        );
      }
    } catch (error) {
      this.logger.error('Error uploading attribute icon:', error);
      throw new BadRequestException(
        error.message || 'Failed to upload attribute icon',
      );
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
    }

    const update = await this.attributeRepository.update(
      data.id,
      attributeData,
    );

    if (update.affected > 0) {
      const payload = await this.attributeRepository.findOneOrFail({
        where: { id: data.id },
      });

      return payload;
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
    await this.attributeRepository.softDelete(data.id);
    return AppStrings.ATTRIBUTE_DELETED_SUCCESSFULLY;
  }

  async findOneAttributeSet(id: string) {
    try {
      return await this.attributeSetRepository.findOne({
        where: { id: id },
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(AppStrings.ATTRIBUTE_SET_NOT_FOUND);
    }
  }

  /**
   * List AttributeSets
   *
   * @async
   * @returns {Promise<AttributeSet[]>}
   */
  async findAllAttributeSets(findOptions: PaginateAndSort) {
    const [attributeSet, total] =
      await this.attributeSetRepository.findAndCount({
        take: findOptions.take,
        skip: findOptions.skip,
      });
    return { attributeSet, total };
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
    await this.attributeSetRepository.softDelete(data.id);
    return AppStrings.ATTRIBUTESET_DELETED_SUCCESSFULLY;
  }
}
