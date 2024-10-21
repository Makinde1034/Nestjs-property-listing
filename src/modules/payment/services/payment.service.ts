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
  VerifyPaymentInput,
} from '../dto/request/payment.input';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { PdfService } from '../../file-handler/services/pdf.service';
import { MailgunEmailService } from '../../mail/services/implementations';
import { generateRandomString } from '../../../common/utils/helper';
import { StorageService } from '../../file-handler/services/storage.service';
import { Readable } from 'stream';
import { QrCodeService } from '../../file-handler/services/qrcode.service';
import {
  AppDefaultConfig,
  getAappDefaultConfigName,
} from '../../../config/app-default/app-default';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../../admin/services/admin.service';
import { CouponResponse } from '../../admin/dto/response/admin-response';

@Injectable()
export class PaymentService {
  private readonly appDefaultConfig: AppDefaultConfig;
  constructor(
    private readonly pdfGeneratorService: PdfService,
    private readonly mailService: MailgunEmailService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly hyperPayService: HyperPayService,
    private readonly storageService: StorageService,
    private readonly qrcodeService: QrCodeService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
  ) {
    this.appDefaultConfig = this.configService.get<AppDefaultConfig>(
      getAappDefaultConfigName(),
    );
  }

  logger = new Logger(PaymentService.name);
  async initializePayment(
    createPaymentInput: InitiatePaymentInput,
    user: User,
  ) {
    if (createPaymentInput.coupon) {
      const coupon: CouponResponse = await this.adminService.isCouponValid(
        createPaymentInput.coupon,
        createPaymentInput.amount,
      );
      console.log(coupon);
      createPaymentInput.amount = coupon.amount;
    }
    console.log(createPaymentInput.amount);
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

  async verifyPayment(data: VerifyPaymentInput) {
    const response = await this.hyperPayService.verifyPayment(data.checkoutId);

    return {
      status: response.result.code,
      message: response.result.description,
    };
  }

  async invoice(data?: PdfInput, user?: User, listing?: Listing) {
    try {
      const payload: CreateInvoiceInput = {
        price: data.sumTotalWithVat,
        vat: data.sumTotalVat,
        expiredAt: addDays(new Date(), 4),
        userId: user.id,
        listingid: listing.id,
      };

      const invoice = await this.invoiceRepository.save(payload);

      const qrcode = await this.qrcodeService.generateQrCode(
        `${this.appDefaultConfig.customerFrontEndUrl}?${invoice.id}`,
      );
      data.qrcode = qrcode;
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
      const url = await this.storageService.upload(multerFile);
      await this.invoiceRepository.update(invoice.id, { file: url });
      await this.mailService.sendEmailInvoice(user, invoicePdf);
      return invoice;
    } catch (error) {
      this.logger.log(error);
    }
  }
}
