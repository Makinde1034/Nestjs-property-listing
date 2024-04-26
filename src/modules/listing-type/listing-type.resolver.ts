/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListingTypeService } from './listing-type.service';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards';
import {
  AttributeSetInput,
  AttributeDeleteInput,
  AttributeInput,
  AttributeSetUpdateInput,
  AttributeUpdateInput,
} from './dtos';
import { Attribute, AttributeSet } from '../../entities';

@Resolver()
export class ListingTypeResolver {
  constructor(private readonly listingTypeService: ListingTypeService) {}

  /**
   * Fetch Attributes
   *
   * @async
   * @returns {Promise<Attribute[]>}
   */
  @Query(() => [Attribute])
  @UseGuards(AccessTokenGuard)
  async fetchAttributes(): Promise<Attribute[]> {
    return await this.listingTypeService.findAllAttributes();
  }

  /**
   * Create Attribute
   *
   * @async
   * @param {Attribute} RequestInput
   * @returns {Promise<Attribute>}
   */
  @Mutation(() => Attribute)
  @UseGuards(AccessTokenGuard)
  async createAttribute(
    @Args('RequestInput') RequestInput: AttributeInput,
  ): Promise<Attribute> {
    return await this.listingTypeService.createAttribute(RequestInput);
  }

  /**
   * Update Attribute
   *
   * @async
   * @param {AttributeUpdateInput} RequestInput
   * @returns {Promise<Attribute>}
   */
  @Mutation(() => Attribute)
  @UseGuards(AccessTokenGuard)
  async updateAttribute(
    @Args('RequestInput') RequestInput: AttributeUpdateInput,
  ): Promise<Attribute> {
    return await this.listingTypeService.updateAttribute(RequestInput);
  }

  /**
   * Delete Attribute
   *
   * @async
   * @param {AttributeDeleteInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @UseGuards(AccessTokenGuard)
  async deleteAttribute(
    @Args('RequestInput') RequestInput: AttributeDeleteInput,
  ): Promise<string> {
    return await this.listingTypeService.deleteAttribute(RequestInput);
  }

  /**
   * Fetch AttributeSets
   *
   * @async
   * @returns {Promise<AttributeSet[]>}
   */
  @Query(() => [AttributeSet])
  @UseGuards(AccessTokenGuard)
  async fetchAttributeSets(): Promise<AttributeSet[]> {
    return await this.listingTypeService.findAllAttributeSets();
  }

  /**
   * Create Attribute
   *
   * @async
   * @param {AttributeSetInput} RequestInput
   * @returns {Promise<AttributeSet>}
   */
  @Mutation(() => AttributeSet)
  @UseGuards(AccessTokenGuard)
  async createAttributeSet(
    @Args('RequestInput') RequestInput: AttributeSetInput,
  ): Promise<AttributeSet> {
    return await this.listingTypeService.createAttributeSet(RequestInput);
  }

  /**
   * Update Attribute
   *
   * @async
   * @param {AttributeSetUpdateInput} RequestInput
   * @returns {Promise<AttributeSet>}
   */
  @Mutation(() => AttributeSet)
  @UseGuards(AccessTokenGuard)
  async updateAttributeSet(
    @Args('RequestInput') RequestInput: AttributeSetUpdateInput,
  ): Promise<AttributeSet> {
    return await this.listingTypeService.updateAttributeSet(RequestInput);
  }

  /**
   * Delete Attribute
   *
   * @async
   * @param {AttributeDeleteInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @UseGuards(AccessTokenGuard)
  async deleteAttributeSet(
    @Args('RequestInput') RequestInput: AttributeDeleteInput,
  ): Promise<string> {
    return await this.listingTypeService.deleteAttributeSet(RequestInput);
  }
}
