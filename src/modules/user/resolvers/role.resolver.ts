/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RoleService } from '../services';
import { Role, Permission } from 'src/entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from 'src/modules/auth/guards';
import { PERMISSION_KEY, Permissions } from 'src/common/decorator/permission';
import {
  DeleteRolesInput,
  RoleData,
  RoleInputDto,
  RoleUpdateInputDto,
} from '../dtos/request';
import { SuccessResponse } from '../../../common/utils/success.response';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { PermissionsEnum } from '../../../common/enums/permission.enum';

@Resolver()
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Fetch Permission
   *
   * @async
   * @returns {Promise<Permission[]>}
   */
  @Query(() => [Permission], { name: 'permissions' })
  @UseGuards(AccessTokenGuard)
  async fetchPermissions(): Promise<Permission[]> {
    return await this.roleService.findAllPermissions();
  }

  /**
   * Fetch Roles
   *
   * @async
   * @returns {Promise<RoleData[]>}
   */
  @Query(() => [RoleData], { name: 'roles' })
  @Permissions(PermissionsEnum.ROLES_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async fetchRoles(): Promise<RoleData[]> {
    return await this.roleService.findAllRoles();
  }

  @Query(() => [Role], { name: 'searchForRoles' })
  @Permissions(PermissionsEnum.ROLES_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async searchForRole(@Args('searchParam') searchParam: string) {
    return await this.roleService.searchForRole(searchParam);
  }

  @Query(() => [Role], { name: 'rolesAndUser' })
  @Permissions(PermissionsEnum.ROLES_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async fetchRolesAndUsers(
    @Args('paginateAndSort') paginateAndSort: PaginateAndSort,
  ): Promise<Role[]> {
    return await this.roleService.fetchRolesAndUser(paginateAndSort);
  }

  /**
   * Create Role
   * @async
   * @param {RoleInputDto} RequestInput
   * @returns {Promise<Role>}
   */
  @Mutation(() => Role)
  @Permissions(PermissionsEnum.ROLES_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createRole(
    @Context() ctx: any,
    @Args('RequestInput') RequestInput: RoleInputDto,
  ): Promise<Role> {
    return await this.roleService.createRole(RequestInput, ctx.req.user);
  }

  /**
   * Update Role
   *
   * @async
   * @param {RoleUpdateInputDto} RequestInput
   * @returns {Promise<Role>}
   */
  @Mutation(() => Role)
  @Permissions(PermissionsEnum.ROLES_EDIT)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateRole(
    @Context() ctx: any,
    @Args('RequestInput') RequestInput: RoleUpdateInputDto,
  ): Promise<Role> {
    return await this.roleService.updateRole(RequestInput, ctx.req.user);
  }

  /**
   * Delete Role
   *
   * @async
   * @param {RoleIdInputDto} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => SuccessResponse)
  @Permissions(PermissionsEnum.ROLES_DELETE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteRole(
    @Context() ctx: any,
    @Args('deleteRoleInput') deleteRoleInput: DeleteRolesInput,
  ) {
    return await this.roleService.deleteRoles(deleteRoleInput, ctx.req.user);
  }

  /**
   * Get User roles
   * @returns { Promise<Role[]>}
   */
  @Query(() => [Role])
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.ROLES_VIEW)
  async getUserRoles(@Context() ctx: any): Promise<Role[]> {
    return await this.roleService.fetchUserRoles(ctx.req.user);
  }

  @Query(() => Role)
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.ROLES_VIEW)
  async getRole(@Args('id') id: number): Promise<Role> {
    return await this.roleService.findRole(id);
  }
}
