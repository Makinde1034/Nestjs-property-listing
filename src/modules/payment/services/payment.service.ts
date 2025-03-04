/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

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
    try {
      if (createPaymentInput.coupon) {
        const coupon: IsCouponValidResponse =
          await this.adminService.isCouponValid({
            code: createPaymentInput.coupon,
            price: createPaymentInput.amount,
          });
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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error.message;
      }

      throw new InternalServerErrorException(
        'Unable to process payment Please try after some minuites',
      );
    }
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
    try {
      const verify = await this.verifyPayment({
        checkoutId: createPaymentInput.paymentId,
      });

      const checkout =
        await this.hyperPayService.capturePayment(createPaymentInput);

      return {
        checkoutId: checkout.id,
        referenceId: checkout.referencedId,
        timeStamp: checkout.timestamp,
      };
    } catch (error) {
      this.logger.debug(error);
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
      if (!data || !user || !listing || !offer) {
        throw new BadRequestException(
          'Missing required data for invoice finalization',
        );
      }

      const payload: CreateInvoiceInput = {
        capturedPrice: invoice.capturedPrice,
        vat: invoice.vat,
        expiredAt: addDays(new Date(), 4),
        userId: user.id,
        listingid: listing.id,
        offerId: offer.id,
      };

      const updatedInvoice = await this.invoiceRepository.save({
        ...invoice,
        ...payload,
        listingTypeId: listing.listingTypeId,
        listing,
        offerId: offer.id,
        vat: data.sumTotalVat,
      });

      const qrcode = await this.qrcodeService.generateQrCode(
        `${this.appDefaultConfig.customerFrontEndUrl}?invoiceId=${invoice.id}`,
      );

      data.qrcode = qrcode;
      data.invoiceNumber = updatedInvoice.id;

      const invoicePdf =
        await this.pdfGeneratorService.generatePdfForInvoice(data);
      if (!invoicePdf || !(invoicePdf instanceof Buffer)) {
        throw new BadRequestException('Failed to generate invoice PDF');
      }

      const multerFile: Express.Multer.File = {
        fieldname: invoice.id.toString(),
        originalname: invoice.id.toString(),
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: invoicePdf,
        size: invoicePdf.length,
        stream: Readable.from(invoicePdf),
        destination: '',
        filename: invoice.id.toString(),
        path: '',
      };

      const url = await this.storageService.upload(multerFile);
      await this.invoiceRepository.update(updatedInvoice.id, {
        file: url,
        offerId: offer.id,
      });

      await this.mailService.sendEmailInvoice(user, invoicePdf);
      return invoice;
    } catch (error) {
      this.logger.error('Error finalizing invoice:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error finalizing invoice:', error);
      throw new BadRequestException('Failed to finalize invoice');
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
