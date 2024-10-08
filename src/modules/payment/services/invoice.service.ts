/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { addDays } from 'date-fns';
import { Readable } from 'stream';

import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { CreateInvoiceInput } from '../dto/invoice';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { PdfService } from '../../file-handler/services/pdf.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../file-handler/services/storage.service';
import { MailgunEmailService } from '../../mail/services/implementations/mailgun.services';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { User } from '../../../entities';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly pdfGeneratorService: PdfService,
    private readonly storageService: StorageService,
    private readonly mailService: MailgunEmailService,
  ) {}
  logger = new Logger(InvoiceService.name);
  async invoice(
    createInvoiceInput: CreateInvoiceInput,
    data?: PdfInput,
    user?: User,
  ) {
    try {
      createInvoiceInput.expiredAt = addDays(new Date(), 4);
      createInvoiceInput.userId = user.id;

      const invoice = await this.invoiceRepository.save(createInvoiceInput);
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
      // Validate and set default where option
      const whereOption =
        findOption?.where?.fieldToChose && findOption?.where?.whereParam
          ? { [findOption.where.fieldToChose]: findOption.where.whereParam }
          : {};

      // Validate and set default order options
      const orderOptions =
        findOption.sortField && findOption.directionToSort
          ? {
              [findOption.sortField]: findOption.directionToSort as
                | 'ASC'
                | 'DESC',
            }
          : { createdAt: 'DESC' as 'ASC' | 'DESC' }; // Default sorting by createdAt in descending order

      // Set take and skip with reasonable defaults
      const take =
        findOption.take && findOption.take > 0 ? findOption.take : 20;
      const skip =
        findOption.skip && findOption.skip >= 0 ? findOption.skip : 0;

      // Fetch invoices and total count
      const [invoices, total] = await this.invoiceRepository.findAndCount({
        where: whereOption,
        order: orderOptions,
        take,
        skip,
      });
      return { invoices, total };
    } catch (error) {
      this.logger.error('Error fetching invoice:', error);
      throw new BadRequestException('Unable to fetch invoices');
    }
  }
}
