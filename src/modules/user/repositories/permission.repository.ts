/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Permission } from '../../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BaseRepository from 'src/modules/core/base.class/base.repository';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
