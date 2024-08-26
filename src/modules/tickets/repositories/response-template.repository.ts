/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { ResponseTemplate } from '../../../entities/response-template.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ResponseTemplateRepository extends Repository<ResponseTemplate> {
  constructor(private dateSource: DataSource) {
    super(ResponseTemplate, dateSource.createEntityManager());
  }
}
