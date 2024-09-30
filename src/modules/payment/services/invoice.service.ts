/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { addDays } from 'date-fns';
import { Readable } from 'stream';
import { Listing, User } from '../../../entities';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { CreateInvoiceInput } from '../dto/invoice';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { QrCodeService } from '../../file-handler/services/qrcode.service';
import { PdfService } from '../../file-handler/services/pdf.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../file-handler/services/storage.service';
import { MailgunEmailService } from '../../mail/services/implementations/mailgun.services';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Injectable()
export class InvoiceService {
  constructor(
    private invoiceRepository: InvoiceRepository,
    private pdfGeneratorService: PdfService,
    private storageService: StorageService,
    private mailService: MailgunEmailService,
  ) {}
  logger = new Logger(InvoiceService.name);
  async invoice(data?: PdfInput, user?: User, listing?: Listing) {
    try {
      const payload: CreateInvoiceInput = {
        expiredAt: addDays(new Date(), 4),
        userId: user.id,
        listingid: listing.id,
      };
      const invoice = await this.invoiceRepository.save(payload);
      data.invoiceNumber = invoice.id;
      const invoicePdf =
        await this.pdfGeneratorService.generatePdfForInvoice(data);
      const multerFile: Express.Multer.File = {
        fieldname: invoice.id.toString(),
        originalname: invoice.id.toString(),
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: invoicePdf,
        size: invoicePdf.length,
        stream: Readable.from(invoicePdf),
        destination: '',
        filename: invoice.id.toString(),
        path: '',
      };
      await this.storageService.uploadFile(multerFile);
      await this.mailService.sendEmailInvoice(user, invoicePdf);
      return invoice;
    } catch (error) {
      this.logger.log(error);
    }
  }

  async fetchInvoice(findOption: PaginateAndSort) {
    try {
      const whereOption = {
        [findOption.where.fieldToChose]: [findOption.where.whereParam],
      };
      const orderOptions = {
        [findOption.sortField]: findOption.directionToSort,
      };
      const [invoices, total] = await this.invoiceRepository.findAndCount({
        where: whereOption ?? {},
        order: orderOptions,
        take: findOption.take ?? 20,
        skip: findOption.skip ?? 0,
      });
      return { invoices, total };
    } catch (error) {
      this.logger.error('Error fetching invoice:', error);
      throw new BadRequestException(error);
    }
  }
}
