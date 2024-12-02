/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionsGuard, RestAccessTokenGuard } from '../../auth/guards';
import { AttributeService, ListingTypeService } from '../services';
import { Permissions } from 'src/common/decorator/permission';

import { Attribute, ListingType } from 'src/entities';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { Context } from '@nestjs/graphql';

@Controller('listing-type')
export class ListingTypeController {
  constructor(
    private readonly listingTypeService: ListingTypeService,
    private readonly attributeService: AttributeService,
  ) {}

  /**
   * Upload Attribute with Icon
   * @async
   * @returns {Promise<Attribute>}
   */
  @UseInterceptors(FileInterceptor('icon'))
  @Permissions('create-attribute-set')
  @Post('/attribute/upload')
  @UseGuards(RestAccessTokenGuard, PermissionsGuard)
  async uploadAttributeIcon(
    @Query('attributeId') attributeId: string,
    @UploadedFile() icon: Express.Multer.File,
  ): Promise<Attribute> {
    return await this.attributeService.uploadAttributeIcon(attributeId, icon);
  }

  /**
   * Upload Attribute with Icon
   * @async
   * @returns {Promise<Attribute>}
   */
  @UseInterceptors(FileInterceptor('icon'))
  @Post('/upload-icon')
  @UseGuards(RestAccessTokenGuard, AdminGuard)
  async uploadListingTypeIcon(
    @Query('listingTypeId') listingTypeId: string,
    @UploadedFile() icon: Express.Multer.File,
    @Context() ctx: any,
  ): Promise<ListingType> {
    return await this.listingTypeService.updateListingTypeIcon(
      listingTypeId,
      ctx.req.user,

      icon,
    );
  }

  @Delete('delete-attributeSet-icon')
  @UseGuards(RestAccessTokenGuard)
  async deleteAttributeSetIcon(
    @Query('attributeSetId') attributeSetId: string,
  ) {
    return await this.attributeService.deleteAttributeIcon(attributeSetId);
  }

  @Delete('delete-attribute-icon')
  @UseGuards(RestAccessTokenGuard)
  async deleteAttributeIcon(@Query('attributeId') attributeId: string) {
    return await this.attributeService.deleteAttributeSetIcon(attributeId);
  }
}
