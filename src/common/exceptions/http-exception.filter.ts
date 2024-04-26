/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { I18nContext } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const i18n = I18nContext.current(host);

    const ctx = gqlHost.getContext();

    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || i18n.t('messages.error.server_error');

    const response = {
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: ctx.req ? ctx.req.url : null,
    };

    ctx.res.status(status).json(response);
    return;
  }
}
