/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';

const AppLogger = new Logger();

export class SuccessResponse {
  status: number;
  message: string;
  data: unknown;

  constructor(message: string = 'successful', data: unknown = null) {
    this.status = 200;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    AppLogger.log(`(LOGS) Success - ${this.message}`);

    if (this.data) {
      return {
        status: 200,
        message: this.message,
        data: this.data,
      };
    }

    return {
      status: 200,
      message: this.message,
    };
  }
}
