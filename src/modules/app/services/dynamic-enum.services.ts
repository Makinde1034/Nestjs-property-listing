/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { ListingTypeService } from '../../listing/services';

type DynamicEnum = { [key: string]: string };

@Injectable()
export class DynamicEnumService {
  constructor(private readonly listingTypeService: ListingTypeService) {}

  async createDynamicEnum(): Promise<DynamicEnum> {
    const values = await this.listingTypeService.findAllListingTypes();
    const enumObject: DynamicEnum = {};
    values.forEach((value) => {
      enumObject[value.name.toUpperCase()] = value.name;
    });
    return enumObject;
  }
}
