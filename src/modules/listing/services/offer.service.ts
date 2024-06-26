/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { CreateOfferDto } from '../dtos/request/offer.dto';
import { OfferRepository } from '../repositories';
import { User } from '../../../entities';
import { PaymentService } from '../../payment/services/payment.service';
@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private paymentService: PaymentService,
  ) {}

  async createAnOffer(createOfferDto: CreateOfferDto, user: User) {
    createOfferDto.userId = user.id;
    const data = {};
    await this.paymentService.invoice(data, user);
    return await this.offerRepository.create(createOfferDto);
  }
}
