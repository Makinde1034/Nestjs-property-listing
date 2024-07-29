/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';

import { SuccessResponse } from '../../../common/response';
import { Listing, User } from '../../../entities';

import { MailgunEmailService } from '../../mail/services/implementations';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { CreateInvoiceInput } from '../dto/invoice';
import { addDays } from 'date-fns';
import { PdfService } from '../../file-handler/services/pdf.service';

@Injectable()
export class PaymentService {
  constructor(
    private pdfGeneratorService: PdfService,
    private mailService: MailgunEmailService,
    private invoiceRepository: InvoiceRepository,
  ) {}
  logger = new Logger(PaymentService.name);
  initializePayment() {
    return new SuccessResponse();
  }

  verifyPayment() {
    return new SuccessResponse();
  }

  async invoice(data?: PdfInput, user?: User, listing?: Listing) {
    try {
      const payload: CreateInvoiceInput = {
        expiredAt: addDays(new Date(), 4),
        price: data.price,
        userId: user.id,
        listingid: listing.id,
      };
      data.item = listing.title;

      const invoice = await this.invoiceRepository.save(payload);
      data.invoiceNumber = invoice.id;
      const invoicePdf =
        await this.pdfGeneratorService.generatePdfForInvoice(data);

      await this.mailService.sendEmailInvoice(user, invoicePdf);
      return invoice;
    } catch (error) {
      this.logger.log(error);
    }
  }
}
