/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { SuccessResponse } from '../../../common/response';
import { PdfGeneratorService } from '../../file-handler/services/pdf.service';
import { User } from '../../../entities';

import { MailgunEmailService } from '../../mail/services/implementations';
import { PdfInput } from '../../file-handler/dto/pdf.dto';

@Injectable()
export class PaymentService {
  constructor(
    private pdfGeneratorService: PdfGeneratorService,
    private mailService: MailgunEmailService,
  ) {}
  initializePayment() {
    return new SuccessResponse();
  }

  verifyPayment() {
    return new SuccessResponse();
  }

  async invoice(data?: PdfInput, user?: User) {
    const invoice = await this.pdfGeneratorService.generatePdfForInvoice(data);

    this.mailService.sendEmailInvoice(user, invoice);
    return invoice;
  }
}
