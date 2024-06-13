/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { AdPackageService } from './services/ad-package.service';
import { AdPackageResolver } from './resolver/ad-package.resolver';
import { AdPackageRepository } from './repositores/ad-package.repository';

@Module({
  providers: [AdPackageResolver, AdPackageService, AdPackageRepository],
  exports: [AdPackageService, AdPackageRepository],
})
export class AdPackageModule {}
