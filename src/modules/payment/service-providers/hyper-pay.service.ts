/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { HttpService } from '@nestjs/axios';

export class HyperPay {
  constructor(private httpService: HttpService) {}

  async preAuthorisedPayment() {}
}
