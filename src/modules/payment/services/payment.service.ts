/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { SuccessResponse } from '../../../common/response';
import { PdfService } from '../../file-handler/services/pdf.service';

import { MailgunEmailService } from '../../mail/services/implementations';

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

  invoice() {}
}
