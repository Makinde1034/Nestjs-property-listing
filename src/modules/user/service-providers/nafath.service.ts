/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import {
  getNafathConfigName,
  NafathConfig,
} from '../../../config/auth/nafath.config';
import { ConfigService } from '@nestjs/config';
import { NafathAuthenticationResponse } from '../../user/dtos/response/nafath';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class NafathService {
  private readonly logger = new Logger(NafathService.name);
  private readonly nafathConfig: NafathConfig;
  private readonly options: AxiosRequestConfig;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.nafathConfig = this.configService.get<NafathConfig>(
      getNafathConfigName(),
    );
    this.options = {
      headers: {
        Authorization: `Bearer ${this.nafathConfig.key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
  }

  async verifyUser() {
    try {
      const payload = this.createPayload();
      const response = await lastValueFrom(
        this.httpService.post<NafathAuthenticationResponse>(
          this.nafathConfig.baseUrl,
          payload,
          this.options,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `HTTP Error Response: ${error?.response?.data || error}`,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  private createPayload() {
    return {
      id: this.nafathConfig.NafathId,
      action: this.nafathConfig.nafathAction,
      service: this.nafathConfig.NafthService,
    };
  }
}
