/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadGatewayException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdPackageInput } from '../dto/create-ad-package.input';
import { UpdateAdPackageInput } from '../dto/update-ad-package.input';
import { AdPackageRepository } from '../repositores/ad-package.repository';
import { I18nService } from 'nestjs-i18n';
import { messagesKeys } from '../../../common/messages/app.strings';

@Injectable()
export class AdPackageService {
  constructor(
    private adrepository: AdPackageRepository,

    private i18n: I18nService,
  ) {}
  async create(createAdPackageInput: CreateAdPackageInput) {
    try {
      return await this.adrepository.save(createAdPackageInput);
    } catch (error) {
      throw new BadGatewayException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async findAll() {
    try {
      return await this.adrepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        this.i18n.t(`messages.${messagesKeys.INTERNAL_SERVER_EXCEPTION}`),
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.adrepository.findOne({ where: { id: id } });
    } catch (error) {
      throw new NotFoundException(
        this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
      );
    }
  }

  async update(id: string, updateAdPackageInput: UpdateAdPackageInput) {
    try {
      return await this.adrepository.update(id, updateAdPackageInput);
    } catch (error) {
      throw new BadGatewayException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async remove(id: string) {
    try {
      const ad = await this.adrepository.findOneBy({ id });

      if (!ad) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
        );
      }
      return await this.adrepository.softDelete(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadGatewayException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }
}
