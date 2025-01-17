/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';

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
import { IsCouponValidResponse } from '../../admin/dto/response/admin-response';
import { ServerSentEvents } from '../../../common/enums';
import { SseService } from '../../sse/client.service';

import { MessageEvent } from '../../sse/request/app';
import { TransactionRepository } from '../repository/transaction.repository';
import { WebHookPaymentResponse } from '../../webhook/dto/wehook.response';
import { TransactionType } from '../../../common/enums/payment.enum';
import { PaymentStatus } from '../../../common/enums/status.enum';
import { SuccessResponse } from '../../../common/utils/success.response';
import { Invoice } from '../../../entities/invoice.entity';
import { Offer } from '../../../entities/offer.entity';

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
    private readonly transactionRepository: TransactionRepository,
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
      const coupon: IsCouponValidResponse =
        await this.adminService.isCouponValid({
          code: createPaymentInput.coupon,
          price: createPaymentInput.amount,
        });
      createPaymentInput.amount = coupon.amount;
    }
    const reference = generateRandomString();

    const checkout = await this.hyperPayService.createCheckout(
      createPaymentInput,
      user,
      reference,
    );

    const data = {
      checkoutId: checkout.id,
      referenceId: reference,
      timeStamp: checkout.timestamp,
    };

    await this.invoiceRepository.save({
      checkkoutId: checkout.id,
      price: createPaymentInput.amount,
      userId: user.id,
      status: PaymentStatus.PENDING,
      reference: reference,
    });
    return data;
  }

  async initializePaymentForPA(
    createPaymentInput: InitiatePaymentInput,
    user: User,
  ) {
    if (createPaymentInput.coupon) {
      const coupon: IsCouponValidResponse =
        await this.adminService.isCouponValid({
          code: createPaymentInput.coupon,
          price: createPaymentInput.amount,
        });
      createPaymentInput.amount = coupon.amount;
    }
    const reference = generateRandomString();

    const checkout = await this.hyperPayService.createCheckoutForPA(
      createPaymentInput,
      user,
      reference,
    );

    await this.invoiceRepository.save({
      checkoutId: checkout.id,
      price: createPaymentInput.amount,
      userId: user.id,
      status: PaymentStatus.PENDING,
      reference: reference,
    });

    const data = {
      checkoutId: checkout.id,
      referenceId: reference,
      timeStamp: checkout.timestamp,
    };

    return data;
  }

  async successNotification(userId: string, referencedId: string) {
    this.logger.log('Action started');

    const payload: MessageEvent = {
      type: ServerSentEvents.SUCCESS,
      data: {
        status: 'successful',
        reference: referencedId,
        message: 'Transaction succeeded',
      },
    };

    this.sseService.sendEvent(userId, payload);
    this.logger.log('notification sent');
  }

  async capturePayment(createPaymentInput: CapturePaymentData) {
    // if (createPaymentInput.coupon) {
    //   const coupon: CouponResponse = await this.adminService.isCouponValid(
    //     createPaymentInput.coupon,
    //     createPaymentInput.amount,
    //   );
    //   createPaymentInput.amount = coupon.amount;
    // }

    try {
      const checkout =
        await this.hyperPayService.capturePayment(createPaymentInput);

      return {
        checkoutId: checkout.id,
        referenceId: checkout.referencedId,
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

  async finalizeInvoice(
    invoice: Invoice,
    data?: PdfInput,
    user?: User,
    listing?: Listing,
    offer?: Offer,
  ) {
    try {
      const payload: CreateInvoiceInput = {
        capturedPrice: data.sumTotalWithVat,
        vat: data.sumTotalVat,
        expiredAt: addDays(new Date(), 4),
        userId: user.id,
        listingid: listing.id,
      };

      const updatedInvoice = await this.invoiceRepository.save({
        ...invoice, // Merge the existing entity to ensure it updates.
        ...payload,
        listingType: listing.listingType,
        listing,
      });

      const qrcode = await this.qrcodeService.generateQrCode(
        `${this.appDefaultConfig.customerFrontEndUrl}?${invoice.id}`,
      );

      data.qrcode = qrcode;
      data.invoiceNumber = updatedInvoice.id;

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

  async finalizeTransaction(webHookPaymentResponse: WebHookPaymentResponse) {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: {
          reference: webHookPaymentResponse.payload.merchantInvoiceId,
        },
        relations: ['user'],
      });

      if (!invoice) {
        throw new BadRequestException('No invoice found');
      }

      const payload = {
        description: webHookPaymentResponse.payload.result.description,
        amount: parseFloat(webHookPaymentResponse.payload.amount),
        transactionType: TransactionType.DEBIT,
        referenceId: webHookPaymentResponse.payload.id,
        needAdminReview: false,
      };

      await this.transactionRepository.save(payload);
      await this.invoiceRepository.update(invoice.id, {
        status: PaymentStatus.PAID,
        capturedPrice: parseFloat(webHookPaymentResponse.payload.amount),
      });

      this.successNotification(invoice.userId, invoice.reference);

      return new SuccessResponse();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
