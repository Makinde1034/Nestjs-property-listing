/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import {
  AttributeSetInput,
  AttributeDeleteInput,
  AttributeInput,
  AttributeSetUpdateInput,
  AttributeUpdateInput,
} from '../dtos/request';
import { Attribute, AttributeSet } from '../../../entities';
import { AttributeService } from '../services';
import { Permissions } from 'src/common/decorator/permission';
import { AttributeFilter } from '../dtos/request/attributes.dto';

@Resolver()
export class AttributeResolver {
  constructor(private readonly attributeService: AttributeService) {}

  /**
   * Fetch Attributes
   *
   * @async
   * @returns {Promise<Attribute[]>}
   */
  @Query(() => [Attribute])
  async fetchAttributes(
    @Args('findOptions', { nullable: true }) findOptions: AttributeFilter,
  ): Promise<Attribute[]> {
    return await this.attributeService.findAllAttributes(findOptions);
  }

  /**
   * Create Attribute
   *
   * @async
   * @param {Attribute} RequestInput
   * @returns {Promise<Attribute>}
   */
  @Mutation(() => Attribute)
  @Permissions('create-attribute-set')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createAttribute(
    @Args('RequestInput') RequestInput: AttributeInput,
  ): Promise<Attribute> {
    return await this.attributeService.createAttribute(RequestInput);
  }

  /**
   * Update Attribute
   *
   * @async
   * @param {AttributeUpdateInput} RequestInput
   * @returns {Promise<Attribute>}
   */
  @Mutation(() => Attribute)
  @Permissions('update-attribute-set')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateAttribute(
    @Args('RequestInput') RequestInput: AttributeUpdateInput,
  ): Promise<Attribute> {
    return await this.attributeService.updateAttribute(RequestInput);
  }

  /**
   * Delete Attribute
   *
   * @async
   * @param {AttributeDeleteInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @Permissions('delete-attribute-set')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteAttribute(
    @Args('RequestInput') RequestInput: AttributeDeleteInput,
  ): Promise<string> {
    return await this.attributeService.deleteAttribute(RequestInput);
  }

  /**
   * Fetch AttributeSets
   *
   * @async
   * @returns {Promise<AttributeSet[]>}
   */
  @Query(() => [AttributeSet])
  async fetchAttributeSets(): Promise<AttributeSet[]> {
    return await this.attributeService.findAllAttributeSets();
  }

  @Query(() => AttributeSet)
  async fetchOneAttributeSets(@Args('id') id: string): Promise<AttributeSet> {
    return await this.attributeService.findOneAttributeSet(id);
  }

  @Query(() => Attribute)
  async fetchOneAttribute(@Args('id') id: string): Promise<Attribute> {
    return await this.attributeService.findOneAttribute(id);
  }

  /**
   * Create Attribute
   *
   * @async
   * @param {AttributeSetInput} RequestInput
   * @returns {Promise<AttributeSet>}
   */
  @Mutation(() => AttributeSet)
  @Permissions('create-attribute-set')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createAttributeSet(
    @Args('RequestInput') RequestInput: AttributeSetInput,
  ): Promise<AttributeSet> {
    return await this.attributeService.createAttributeSet(RequestInput);
  }

  /**
   * Update Attribute
   *
   * @async
   * @param {AttributeSetUpdateInput} RequestInput
   * @returns {Promise<AttributeSet>}
   */
  @Mutation(() => AttributeSet)
  @Permissions('update-attribute-set')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateAttributeSet(
    @Args('RequestInput') RequestInput: AttributeSetUpdateInput,
  ): Promise<AttributeSet> {
    return await this.attributeService.updateAttributeSet(RequestInput);
  }

  /**
   * Delete Attribute
   *
   * @async
   * @param {AttributeDeleteInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @Permissions('delete-attribute-set')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteAttributeSet(
    @Args('RequestInput') RequestInput: AttributeDeleteInput,
  ): Promise<string> {
    return await this.attributeService.deleteAttributeSet(RequestInput);
  }
}
