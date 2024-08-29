/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RoleService } from '../services';
import { Role, Permission } from 'src/entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from 'src/modules/auth/guards';
import { Permissions } from 'src/common/decorator/permission';
import {
  RoleData,
  RoleIdInputDto,
  RoleInputDto,
  RoleUpdateInputDto,
} from '../dtos/request';

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
  @Permissions('read-role')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async fetchRoles(): Promise<RoleData[]> {
    return await this.roleService.findAllRoles();
  }

  /**
   * Create Role
   *
   * @async
   * @param {RoleInputDto} RequestInput
   * @returns {Promise<Role>}
   */
  @Mutation(() => Role)
  @Permissions('create-role')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createRole(
    @Args('RequestInput') RequestInput: RoleInputDto,
  ): Promise<Role> {
    return await this.roleService.createRole(RequestInput);
  }

  /**
   * Update Role
   *
   * @async
   * @param {RoleUpdateInputDto} RequestInput
   * @returns {Promise<Role>}
   */
  @Mutation(() => Role)
  @Permissions('update-role')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateRole(
    @Args('RequestInput') RequestInput: RoleUpdateInputDto,
  ): Promise<Role> {
    return await this.roleService.updateRole(RequestInput);
  }

  /**
   * Delete Role
   *
   * @async
   * @param {RoleIdInputDto} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @Permissions('delete-role')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteRole(
    @Args('RequestInput') RequestInput: RoleIdInputDto,
  ): Promise<string> {
    return await this.roleService.deleteRole(RequestInput);
  }

  /**
   * Get User roles
   *
   * @returns { Promise<User>}
   */
  @Query(() => [Role])
  @UseGuards(AccessTokenGuard)
  async getUserRoles(@Context() ctx): Promise<Role[]> {
    return await this.roleService.fetchUserRoles(ctx.req.user);
  }
}
