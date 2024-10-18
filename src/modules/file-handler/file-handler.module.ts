/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { PdfService } from './services/pdf.service';
import { QrCodeService } from './services/qrcode.service';
import { ExportService } from './services/export.service';
import { FileController } from './controller/file.controller';

@Global()
@Module({
  imports: [],
  controllers: [FileController],
  providers: [PdfService, StorageService, QrCodeService, ExportService],
  exports: [PdfService, StorageService, QrCodeService, ExportService],
})
export class FilehandlerModule {}
