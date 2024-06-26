/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { PuppeteerModule } from 'nest-puppeteer';

import { PdfGeneratorService } from './services/pdf.service';

@Global()
@Module({
  imports: [PuppeteerModule.forFeature()],
  providers: [PdfGeneratorService, StorageService],
  exports: [PdfGeneratorService, StorageService],
})
export class FilehandlerModule {}
