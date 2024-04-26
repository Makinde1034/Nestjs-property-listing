/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import {
  AttributeSetInput,
  AttributeDeleteInput,
  AttributeInput,
  AttributeSetUpdateInput,
  AttributeUpdateInput,
} from '../dtos';
import { Attribute, AttributeSet } from '../../../entities';
import { AttributeService } from '../services';

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
  @UseGuards(AccessTokenGuard)
  async fetchAttributes(): Promise<Attribute[]> {
    return await this.attributeService.findAllAttributes();
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
  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
  async fetchAttributeSets(): Promise<AttributeSet[]> {
    return await this.attributeService.findAllAttributeSets();
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
  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
  async deleteAttributeSet(
    @Args('RequestInput') RequestInput: AttributeDeleteInput,
  ): Promise<string> {
    return await this.attributeService.deleteAttributeSet(RequestInput);
  }
}
