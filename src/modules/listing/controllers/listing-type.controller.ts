/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Controller,
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

import { Attribute } from 'src/entities';

@Controller('listing-type')
export class ListingTypeController {
  constructor(
    private readonly listingTypeService: ListingTypeService,
    private readonly attributeService: AttributeService,
  ) {}

  /**
   * Upload Attribute with Icon
   *
   * @async
   * @returns {Promise<Attribute>}
   */
  @UseInterceptors(FileInterceptor('icon'))
  @Permissions('create-attribute-set')
  @Post('/attribute/upload')
  @UseGuards(RestAccessTokenGuard, PermissionsGuard)
  async uploadAttributeIcon(
    @Query('attributId') attributId: string,
    @UploadedFile() icon: Express.Multer.File,
  ): Promise<Attribute> {
    return await this.attributeService.uploadAttributeIcon(attributId, icon);
  }
}
