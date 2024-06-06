/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import BaseEntity from '../../../entities/base.entity';

@Injectable()
export abstract class EntityRepository<T extends BaseEntity> {
  /**
   * Entity name from child class
   *
   * @type {string}
   */
  entityName: string;

  constructor(
    private readonly baseRepository: Repository<T>,
    // Private readonly i18n: I18nService,
  ) {
    this.entityName = baseRepository.metadata.targetName;
  }

  /**
   * Find by id
   *
   * @async
   * @param {string} id
   * @returns {Promise<T>}
   */
  async findById(id: string, relations?: string[]): Promise<T> {
    return await this.baseRepository.findOne({
      where: { id },
      relations,
    } as FindOneOptions<T>);
  }

  /**
   * Find by id or fail
   *
   * @async
   * @param {string} id
   * @returns {Promise<T>}
   */
  async findByIdOrFail(id: string, relations?: string[]): Promise<T> {
    const item = await this.findById(id, relations);
    if (!item) {
      throw new NotFoundException(`${this.entityName.toUpperCase()} not Found`);
    }
    return item;
  }

  /**
   * Find One
   *
   * @async
   * @param {FindOneOptions<T>} options
   * @returns {Promise<T>}
   */
  async findOne(options: FindOneOptions<T>): Promise<T> {
    return await this.baseRepository.findOne(options);
  }

  /**
   * Find All
   *
   * @async
   * @param {?FindManyOptions<T>} [options]
   * @returns {Promise<T[]>}
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.baseRepository.find(options);
  }

  /**
   * Count
   *
   * @async
   * @param {?FindManyOptions<T>} [options]
   * @returns {Promise<[[Entity], number>]}
   */
  async findAndCountBy(
    options?: FindOptionsWhere<any>,
  ): Promise<[T[], number]> {
    return await this.baseRepository.findAndCountBy(options);
  }
  async findAndCount(options?: FindManyOptions<any>): Promise<[T[], number]> {
    return await this.baseRepository.findAndCount(options);
  }

  /**
   * Count
   *
   * @async
   * @param {?FindManyOptions<T>} [options]
   * @returns {Promise<number>}
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return await this.baseRepository.count(options);
  }

  /**
   * Create
   *
   * @async
   * @param {DeepPartial<T>} data
   * @returns {Promise<T>}
   */
  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const item = this.baseRepository.create(data);
      return await this.baseRepository.save(item);
    } catch (error: any) {
      if (error.driverError?.code === PostgresError.UNIQUE_VIOLATION) {
        throw new BadRequestException(
          `${this.entityName.toUpperCase()} already exist`,
        );
      }
      throw new BadRequestException(error);
    }
  }

  /**
   * Find Or Create
   *
   * @async
   * @param {DeepPartial<T>} data
   * @returns {Promise<T>}
   */
  async findOrCreate(
    options: FindOneOptions<T>,
    data: DeepPartial<T>,
  ): Promise<T> {
    try {
      const item = await this.findOne(options);
      if (item) {
        return item;
      }
      const newitem = this.baseRepository.create(data);
      return await this.baseRepository.save(newitem);
    } catch (error: any) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Update
   *
   * @async
   * @param {string} id
   * @param {DeepPartial<T>} data
   * @returns {Promise<T>}
   */
  async update(id: string, data: DeepPartial<T>): Promise<T> {
    try {
      const item = await this.findByIdOrFail(id);
      // Using save to fire entity hooks
      return await this.baseRepository.save(Object.assign(item, data));
    } catch (error: any) {
      if (error.driverError?.code === PostgresError.UNIQUE_VIOLATION) {
        throw new BadRequestException(
          `${this.entityName.toUpperCase()} already exist`,
        );
      }
      throw error;
    }
  }

  /**
   * Delete by Id
   *
   * @async
   * @param {string} id
   * @returns {Promise<string>}
   */
  async delete(id: string): Promise<string> {
    const item = await this.findByIdOrFail(id);
    await this.baseRepository.remove(item);
    return id;
  }

  /**
   * SoftDelete by Id
   *
   * @async
   * @param {string} id
   * @returns {Promise<string>}
   */
  async softDelete(id: string): Promise<string> {
    await this.findByIdOrFail(id);
    await this.baseRepository.softDelete(id);
    return id;
  }

  /**
   * Query builder
   *
   * @async
   * @param {string} name
   * @returns {SelectQueryBuilder<T> }
   */
  queryBuilder(name: string): SelectQueryBuilder<T> {
    return this.baseRepository.createQueryBuilder(name);
  }
}
