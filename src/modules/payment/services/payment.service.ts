/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { SuccessResponse } from '../../../common/response';

@Injectable()
export class PaymentService {
  initializePayment() {
    return new SuccessResponse();
  }

  verifyPayment() {
    return new SuccessResponse();
  }
}
