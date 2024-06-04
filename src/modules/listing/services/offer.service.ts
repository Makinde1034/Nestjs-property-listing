/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { CreateOfferDto } from '../dtos/request/offer.dto';
import { OfferRepository } from '../repositories';
import { User } from '../../../entities';
@Injectable()
export class OfferService {
  constructor(private readonly offerRepository: OfferRepository) {}

  async createAnOffer(createOfferDto: CreateOfferDto, user: User) {
    createOfferDto.userId = user.id;
    return await this.offerRepository.create(createOfferDto);
  }
}
