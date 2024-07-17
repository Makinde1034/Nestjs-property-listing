/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
@Controller()
export class WebHookController {
  @Post('webhook/payment')
  @HttpCode(200)
  payment() {
    return HttpStatus.OK;
  }
  @Post('api/v1/user/iam')
  @HttpCode(200)
  user() {
    return HttpStatus.OK;
  }
}
