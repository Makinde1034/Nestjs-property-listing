/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { PdfService } from './services/pdf.service';
import { QrCodeService } from './services/qrcode.service';

@Global()
@Module({
  imports: [],
  providers: [PdfService, StorageService, QrCodeService],
  exports: [PdfService, StorageService, QrCodeService],
})
export class FilehandlerModule {}
