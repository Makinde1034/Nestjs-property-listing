import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import {
  getNafathConfigName,
  NafathConfig,
} from '../../../config/auth/nafath.config';
import { ConfigService } from '@nestjs/config';

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
      const payload = {
        id: '1002927786',
        action: 'SpRequest',
        service: 'DigitalServiceEnrollmentWithoutBio',
      };

      const data: NafathAuthenticationResponse = await this.httpService.post(
        this.nafathConfig.baseUrl,
        payload,
        this.options,
      );
    } catch (error) {}
  }
}
