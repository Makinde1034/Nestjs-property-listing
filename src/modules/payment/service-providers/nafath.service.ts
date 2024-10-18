import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import {
  HyperpayConfig,
  getHyperpayConfigName,
} from '../../../config/payment/hyper-payment.config';
import { NafathConfig } from '../../../config/auth/nafath.config';
import { ConfigService } from '@nestjs/config';

export class NafathService {
  private readonly logger = new Logger(NafathService.name);
  private nafathConfig: NafathConfig;
  private readonly options: AxiosRequestConfig;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.nafathConfig = this.configService.get<HyperpayConfig>(
      getHyperpayConfigName(),
    );

    this.options = {
      headers: {
        Authorization: `Bearer ${this.nafathConfig.token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
  }
}
