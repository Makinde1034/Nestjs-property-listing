/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Role, RolePermissions } from '../../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BaseRepository from '../../core/base.class/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}

@Injectable()
export class RolePermissionRepository extends BaseRepository<RolePermissions> {
  constructor(
    @InjectRepository(RolePermissions)
    private readonly repository: Repository<RolePermissions>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
