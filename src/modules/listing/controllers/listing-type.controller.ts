/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionsGuard, RestAccessTokenGuard } from '../../auth/guards';
import { AttributeService, ListingTypeService } from '../services';
import { Permissions } from 'src/common/decorator/permission';
import {
  AttributeInput,
  AttributeUpdateInput,
  ListingTypeInput,
  ListingTypeUpdateInput,
} from '../dtos/request';
import { ListingType, Attribute } from 'src/entities';

@Controller('api/listing-type')
export class ListingTypeController {
  constructor(
    private readonly listingTypeService: ListingTypeService,
    private readonly attributeService: AttributeService,
  ) {}

  /**
   * Create Lising Type with Icon upload
   *
   * @async
   * @param {Express.Multer.File} icon
   * @returns {Promise<UserDetailsResponse>}
   */
  @UseInterceptors(FileInterceptor('icon'))
  @Post('/create')
  @Permissions('create-listing-type')
  @UseGuards(RestAccessTokenGuard, PermissionsGuard)
  async createListingType(
    @Body() RequestInput: ListingTypeInput,
    @UploadedFile() icon: Express.Multer.File,
  ): Promise<ListingType> {
    return await this.listingTypeService.createListingType(RequestInput, icon);
  }

  /**
   * Update Lising Type with Icon upload
   *
   * @async
   * @param {Express.Multer.File} icon
   * @returns {Promise<UserDetailsResponse>}
   */
  @UseInterceptors(FileInterceptor('icon'))
  @Patch('/update')
  @Permissions('update-listing-type')
  @UseGuards(RestAccessTokenGuard, PermissionsGuard)
  async updateListingType(
    @Body() RequestInput: ListingTypeUpdateInput,
    @UploadedFile() icon: Express.Multer.File,
  ): Promise<ListingType> {
    return await this.listingTypeService.updateListingType(RequestInput, icon);
  }

  /**
   * Create Attribute with Icon upload
   *
   * @async
   * @param {Attribute} RequestInput
   * @returns {Promise<Attribute>}
   */
  @UseInterceptors(FileInterceptor('icon'))
  @Permissions('create-attribute-set')
  @Post('/attribute/create')
  @UseGuards(RestAccessTokenGuard, PermissionsGuard)
  async createAttribute(
    @Body() RequestInput: AttributeInput,
    @UploadedFile() icon: Express.Multer.File,
  ): Promise<Attribute> {
    return await this.attributeService.createAttribute(RequestInput, icon);
  }

  /**
   * Update Attribute with Icon upload
   *
   * @async
   * @param {AttributeUpdateInput} RequestInput
   * @returns {Promise<Attribute>}
   */
  @UseInterceptors(FileInterceptor('icon'))
  @Permissions('update-attribute-set')
  @UseGuards(RestAccessTokenGuard, PermissionsGuard)
  async updateAttribute(
    @Body() RequestInput: AttributeUpdateInput,
    @UploadedFile() icon: Express.Multer.File,
  ): Promise<Attribute> {
    return await this.attributeService.updateAttribute(RequestInput, icon);
  }
}
