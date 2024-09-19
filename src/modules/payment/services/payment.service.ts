/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';

import { addDays } from 'date-fns';

import { CreateInvoiceInput } from '../dto/invoice';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { HyperPayService } from '../service-providers/hyper-pay.service';
import { Listing, User } from '../../../entities';
import {
  InitiatePaymentInput,
  verifyPaymentInput,
} from '../dto/request/payment.input';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { PdfService } from '../../file-handler/services/pdf.service';
import { MailgunEmailService } from '../../mail/services/implementations';
import { generateRandomString } from '../../../common/utils/helper';
import { StorageService } from '../../file-handler/services/storage.service';
import { Readable } from 'stream';
import { QrCodeService } from '../../file-handler/services/qrcode.service';

@Injectable()
export class PaymentService {
  constructor(
    private pdfGeneratorService: PdfService,
    private mailService: MailgunEmailService,
    private invoiceRepository: InvoiceRepository,
    private readonly hyperPayService: HyperPayService,
    private storageService: StorageService,
    private readonly qrcodeService: QrCodeService,
  ) {}
  logger = new Logger(PaymentService.name);
  async initializePayment(
    createPaymentInput: InitiatePaymentInput,
    user: User,
  ) {
    const checkout = await this.hyperPayService.createCheckout(
      createPaymentInput,
      user,
    );

    return {
      checkoutId: checkout.id,
      referenceId: generateRandomString(),
      timeStamp: checkout.timestamp,
    };
  }

  async verifyPayment(data: verifyPaymentInput) {
    const response = await this.hyperPayService.verifyPayment(data.checkoutId);

    return {
      status: response.result.code,
      message: response.result.description,
    };
  }

  async invoice(data?: PdfInput, user?: User, listing?: Listing) {
    try {
      const qrcode = await this.qrcodeService.generateQrCode('');
      const payload: CreateInvoiceInput = {
        qrcode: qrcode,
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
}
