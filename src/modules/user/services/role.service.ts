/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { PermissionRepository, RoleRepository } from '../repositories';
import { Permission, Role } from 'src/entities';
import { RoleIdInputDto, RoleInputDto, RoleUpdateInputDto } from '../dtos';
import { In } from 'typeorm';
import slugify from 'slugify';
import { AppStrings } from 'src/common/messages/app.strings';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  /**
   * List Permissions
   *
   * @async
   * @returns {Promise<Permission[]>}
   */
  async findAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  /**
   * List Roles
   *
   * @async
   * @returns {Promise<Role[]>}
   */
  async findAllRoles(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  /**
   * Create Role
   *
   * @async
   * @param {RoleInput} input
   * @returns {Promise<Role>}
   */
  async createRole(input: RoleInputDto): Promise<Role> {
    const permissions = await this.permissionRepository.find({
      where: { id: In([...input.permissions]) },
    });
    const data: Partial<Role> = {
      name: input.name,
      permissions,
      slug: slugify(input.name),
    };
    const roleData = this.roleRepository.create(data);
    return await this.roleRepository.save(roleData);
  }

  /**
   * Update Role
   *
   * @async
   * @param {RoleUpdateInputDto} input
   * @returns {Promise<Role>}
   */
  async updateRole(input: RoleUpdateInputDto): Promise<Role> {
    const role = await this.roleRepository.findOneByOrFail({
      id: input.roleId,
    });
    const permissions = await this.permissionRepository.find({
      where: { id: In([...input.permissions]) },
    });
    const data: Partial<Role> = {
      name: input.name,
      permissions,
      slug: slugify(input.name),
    };
    return await this.roleRepository.save(Object.assign(role, data));
  }

  /**
   * Delete Role
   *
   * @async
   * @param {RoleIdInputDto} data
   * @returns {Promise<string>}
   */
  async deleteRole(data: RoleIdInputDto): Promise<string> {
    const role = await this.roleRepository.findOneByOrFail({
      id: data.roleId,
    });
    await this.roleRepository.remove(role);
    return AppStrings.ROLE_DELETED_SUCCESSFULLY;
  }
}
