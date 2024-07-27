import { HttpService } from '@nestjs/axios';

export class HyperPay {
  constructor(private httpService: HttpService) {}

  async preAuthorisedPayment() {}
}
