/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { SuccessResponse } from '../../../common/response';
import { PdfService } from '../../file-handler/services/pdf.service';
import { User } from '../../../entities';

import { MailgunEmailService } from '../../mail/services/implementations';
import { PdfInput } from '../../file-handler/dto/pdf.dto';

@Injectable()
export class PaymentService {
  constructor(
    private pdfGeneratorService: PdfService,
    private mailService: MailgunEmailService,
  ) {}
  initializePayment() {
    return new SuccessResponse();
  }

  verifyPayment() {
    return new SuccessResponse();
  }

  async invoice(data?: PdfInput, user?: User, listingOwner?: User) {
    const invoice = await this.pdfGeneratorService.pdfGeneratorService(data);
    this.mailService.sendEmailInvoice(user, invoice, 'buyer');
    this.mailService.sendEmailInvoice(listingOwner, null, 'buyer');
    return invoice;
  }
}
