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
  CapturePaymentData,
  InitiatePaymentInput,
  PreAuthorisedPaymentInput,
  RefundPaymentData,
  VerifyPaymentInput,
} from '../dto/request/payment.input';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { PdfService } from '../../file-handler/services/pdf.service';
import { MailgunEmailService } from '../../mail/services/implementations';
import { generateRandomString, sleep } from '../../../common/utils/helper';
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
import { ServerSentEvents } from '../../../common/enums';
import { SseService } from '../../sse/client.service';

import { MessageEvent } from '../../sse/request/app';
import { messaging } from 'firebase-admin';

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

    private readonly sseService: SseService,
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
      const coupon: CouponResponse = await this.adminService.isCouponValid({
        code: createPaymentInput.coupon,
        price: createPaymentInput.amount,
      });
      createPaymentInput.amount = coupon.amount;
    }
    const checkout = await this.hyperPayService.createCheckout(
      createPaymentInput,
      user,
    );

    const data = {
      checkoutId: checkout.id,
      referenceId: generateRandomString(),
      timeStamp: checkout.timestamp,
    };

    this.performActionWithDelay(user, data);

    return data;
  }
  async initializePaymentForPA(
    createPaymentInput: InitiatePaymentInput,
    user: User,
  ) {
    if (createPaymentInput.coupon) {
      const coupon: CouponResponse = await this.adminService.isCouponValid({
        code: createPaymentInput.coupon,
        price: createPaymentInput.amount,
      });
      createPaymentInput.amount = coupon.amount;
    }
    const checkout = await this.hyperPayService.createCheckoutForPA(
      createPaymentInput,
      user,
    );

    const data = {
      checkoutId: checkout.id,
      referenceId: generateRandomString(),
      timeStamp: checkout.timestamp,
    };

    this.performActionWithDelay(user, data);

    return data;
  }

  async performActionWithDelay(user: any, data: any) {
    this.logger.log('Action started');

    const payload: MessageEvent = {
      type: ServerSentEvents.SUCCESS,
      data: {
        status: 'successful',
        reference: data.referencedId,
        message: 'Transaction succeeded',
      },
    };
    // Sleep for 2 seconds (2000 milliseconds)
    await sleep(30000);
    this.sseService.sendEvent(user.id, payload);
    this.logger.log('Action resumed after 30 seconds');
  }

  async preAuthorized(
    createPaymentInput: PreAuthorisedPaymentInput,
    // User: User,
  ) {
    if (createPaymentInput.coupon) {
      const coupon: CouponResponse = await this.adminService.isCouponValid({
        code: createPaymentInput.coupon,
        price: createPaymentInput.amount,
      });
      createPaymentInput.amount = coupon.amount;
    }

    const checkout =
      await this.hyperPayService.preAuthorize(createPaymentInput);

    const data = await this.capturePayment({
      paymentId: checkout.id,
      amount: '300',
    });

    return {
      checkoutId: checkout.id,
      referenceId: generateRandomString(),
      timeStamp: checkout.timestamp,
    };
  }

  async capturePayment(createPaymentInput: CapturePaymentData) {
    // If (createPaymentInput.coupon) {
    //   Const coupon: CouponResponse = await this.adminService.isCouponValid(
    //     CreatePaymentInput.coupon,
    //     CreatePaymentInput.amount,
    //   );
    //   CreatePaymentInput.amount = coupon.amount;
    // }
    try {
      const checkout =
        await this.hyperPayService.capturePayment(createPaymentInput);

      return {
        checkoutId: checkout.id,
        referenceId: generateRandomString(),
        timeStamp: checkout.timestamp,
      };
    } catch (error) {
      this.logger.log(error);
    }
  }

  async refundPayment(createPaymentInput: RefundPaymentData) {
    const checkout =
      await this.hyperPayService.refundPayment(createPaymentInput);

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

      referenceId: response.result?.referencedId,
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

      const invoice = await this.invoiceRepository.save({
        ...payload,
        listingType: listing.listingType,
        listing,
      });

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
