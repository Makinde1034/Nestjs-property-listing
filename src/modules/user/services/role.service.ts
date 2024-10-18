/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PermissionRepository,
  RoleRepository,
  UserRepository,
  RolePermissionRepository,
} from '../repositories';
import { Permission, Role, RolePermissions, User } from 'src/entities';
import {
  DeleteRolesInput,
  PermissionData,
  RoleData,
  RoleIdInputDto,
  RoleInputDto,
  RoleUpdateInputDto,
} from '../dtos/request';
import { DeepPartial, In } from 'typeorm';
import slugify from 'slugify';
import { AppStrings } from '../../../common/messages/app.strings';
import { SuccessResponse } from '../../../common/utils/success.response';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly staffRepository: UserRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  logger = new Logger(RoleService.name);

  /**
   * List Permissions
   *
   * @async
   * @returns {Promise<Permission[]>}
   */
  async findAllPermissions(): Promise<Permission[]> {
    try {
      const result = await this.permissionRepository.find();
      return result;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async deleteRoles(deleteRoleInput: DeleteRolesInput) {
    try {
      const { affected } = await this.roleRepository.update(
        { id: In(deleteRoleInput.id) },
        { deletedAt: new Date() },
      );

      if (affected > 0) {
        return new SuccessResponse(AppStrings.ROLE_DELETED_SUCCESSFULLY);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
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
          name: item.englishName,
          slug: item.slug,
          permissions: permissionData,
        };
      }),
    );
    return roleData;
  }

  async findRole(id: number): Promise<Role> {
    try {
      const role = await this.roleRepository
        .createQueryBuilder('role')

        .leftJoinAndSelect('role.user', 'user')
        .leftJoinAndSelect('role.rolePermissions', 'rolePermissions')
        .where('role.id =:id', { id })
        .select([
          'role.id',
          'role.englishName',
          'role.arabicName',
          'rolePermissions.permissionId',
          'rolePermissions.approve',
          'rolePermissions.use',
          'user.id',
          'user.employeeId',
          'user.firstName',
          'user.lastName',
        ])
        .getOne();
      if (!role) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      return role;
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException(AppStrings.NOT_FOUND);
    }
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
      englishName: input.englishName,
      arabicName: input.arabicName,
      permissions,
      slug: slugify(input.englishName),
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
          use: inputItem.use,
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
      id: input.id,
    });
    const permissionIds = input.permissions.map((item) => item.permissionId);
    const permissions = await this.permissionRepository.find({
      where: { id: In([...permissionIds]) },
    });

    const data: Partial<Role> = {
      englishName: input.englishName,
      arabicName: input.arabicName,
      permissions,
      slug: slugify(input.englishName),
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
  async disableRole(data: RoleIdInputDto): Promise<string> {
    const role = await this.roleRepository.findOneByOrFail({
      id: data.roleId,
    });

    if (role) {
      await this.roleRepository.update(data.roleId, { isDisabled: true });
      return AppStrings.SUCCESSFULLY_DISABLED;
    }
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

  async fetchRolesAndUser(paginateAndSort: PaginateAndSort): Promise<Role[]> {
    try {
      if (paginateAndSort.take && paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }
      const roles = await this.roleRepository.find({
        take: paginateAndSort.take,
        skip: paginateAndSort.skip,
        relations: ['user'],
      });
      return roles;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
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

  async searchForRole(searchParam: string) {
    try {
      return this.roleRepository
        .createQueryBuilder('role')

        .orWhere('role.arabicName LIKE :term', { term: `%${searchParam}%` })

        .orWhere('role.englishName LIKE :term', { term: `%${searchParam}%` })
        .take(10)

        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
