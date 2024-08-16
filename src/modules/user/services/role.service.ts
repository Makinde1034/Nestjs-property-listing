/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import {
  PermissionRepository,
  RoleRepository,
  UserRepository,
  RolePermissionRepository,
} from '../repositories';
import { Permission, Role, RolePermissions, User } from 'src/entities';
import {
  PermissionData,
  RoleData,
  RoleIdInputDto,
  RoleInputDto,
  RoleUpdateInputDto,
} from '../dtos';
import { DeepPartial, In } from 'typeorm';
import slugify from 'slugify';
import { AppStrings } from '../../../common/messages/app.strings';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly staffRepository: UserRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  /**
   * List Permissions
   *
   * @async
   * @returns {Promise<Permission[]>}
   */
  async findAllPermissions(): Promise<Permission[]> {
    const result = await this.permissionRepository.find();
    return result;
  }

  listPermissions(items: RolePermissions[]): PermissionData[] {
    const result: PermissionData[] = items.map((item) => ({
      id: item.permission.id,
      approve: item.approve,
      slug: item.permission.slug,
      category: item.permission.category,
      staffAccess: item.permission.staffAccess,
      individualAccess: item.permission.individualAccess,
      companyAccess: item.permission.companyAccess,
      description: item.permission.functionDescription,
    }));
    return result;
  }

  /**
   * List Roles
   *
   * @async
   * @returns {Promise<Role[]>}
   */
  async findAllRoles(): Promise<RoleData[]> {
    const roles = await this.roleRepository.find({
      relations: ['permissions'],
    });
    const roleData: RoleData[] = await Promise.all(
      roles.map(async (item) => {
        const permissionIds = item.permissions.map(
          (permission) => permission.id,
        );
        const permissionItems = await this.rolePermissionRepository.find({
          where: { permission: { id: In([...permissionIds]) } },
          relations: ['permission'],
        });
        const permissionData = this.listPermissions(permissionItems);
        delete item.permissions;
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          permissions: permissionData,
        };
      }),
    );
    return roleData;
  }

  /**
   * Create Role
   *
   * @async
   * @param {RoleInput} input
   * @returns {Promise<Role>}
   */
  async createRole(input: RoleInputDto): Promise<Role> {
    const permissionIds = input.permissions.map((item) => item.permissionId);
    const permissions = await this.permissionRepository.find({
      where: { id: In([...permissionIds]) },
    });
    const data: Partial<Role> = {
      name: input.name,
      permissions,
      slug: slugify(input.name),
    };
    const roleData = this.roleRepository.create(data);
    const role = await this.roleRepository.save(roleData);

    const rolePermissions: DeepPartial<RolePermissions[]> = permissions
      .map((permissionItem) => {
        const inputItem = input.permissions.find(
          (item) => item.permissionId === permissionItem.id,
        );
        if (!inputItem) {
          return null;
        }
        return {
          permission: permissionItem,
          approve: inputItem.approve,
          role,
        };
      })
      .filter((item) => item !== null);

    await this.rolePermissionRepository.save(rolePermissions);

    return role;
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
    const permissionIds = input.permissions.map((item) => item.permissionId);
    const permissions = await this.permissionRepository.find({
      where: { id: In([...permissionIds]) },
    });

    const data: Partial<Role> = {
      name: input.name,
      permissions,
      slug: slugify(input.name),
    };

    const rolePermissions: DeepPartial<RolePermissions[]> = permissions
      .map((permissionItem) => {
        const inputItem = input.permissions.find(
          (item) => item.permissionId === permissionItem.id,
        );
        if (!inputItem) {
          return null;
        }
        return {
          permission: permissionItem,
          approve: inputItem.approve,
          role,
        };
      })
      .filter((item) => item !== null);

    await this.rolePermissionRepository.save(rolePermissions);
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

  /**
   * Fetch user Roles
   *
   * @async
   * @param {User} user
   * @returns {Promise<string>}
   */
  async fetchUserRoles(user: User): Promise<Role[]> {
    const userData = await this.staffRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['roles'],
    });
    return userData.roles;
  }

  /**
   * Check if User has passed permission
   *
   *
   * @param {User} user
   * @param {string[]} requiredPermissions
   * @returns {boolean}
   */

  async hasPermission(
    user: User,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const staff = await this.staffRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['roles'],
    });

    const permissions = staff.roles.map((role) => role.permissions).flat();
    return permissions.some((permission) =>
      requiredPermissions.includes(permission.slug),
    );
  }
}
