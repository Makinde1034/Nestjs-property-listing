/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { AdminService } from '../services/admin.service';
import {
  FinancialVsOrder,
  ListingStats,
  ResponseTime,
  SaiiFees,
  UserAgeRange,
  UserCountryCount,
  UserDemography,
  UserFunneling,
  UserGenderCount,
} from '../dto/response/admin-response';

import { Args, Query, Resolver } from '@nestjs/graphql';

import { AdminDashboardSort } from '../dto/request/admin-request';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminDefault } from '../../../entities/admin-table.entity';

@Resolver()
@UseGuards(AccessTokenGuard)
export class AdminResolver {
  constructor(private adminService: AdminService) {}
  @UseGuards(AdminGuard)
  @Query(() => ListingStats, { name: 'listingStats' })
  async listingStats(
    @Args('findOptions') findOption: AdminDashboardSort,
  ): Promise<ListingStats> {
    return await this.adminService.listingStats(findOption);
  }
  @Query(() => AdminDefault, { name: 'adminDefault' })
  async adminDefault() {
    return await this.adminService.adminDefault();
  }
  @UseGuards(AdminGuard)
  @Query(() => UserDemography, { name: 'totalUser' })
  async totalUser(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.userDemography(findOption);
  }
  @UseGuards(AdminGuard)
  @Query(() => [UserGenderCount], { name: 'userCount' })
  async userCount(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.userGenderCount(findOption);
  }
  @UseGuards(AdminGuard)
  @Query(() => [UserCountryCount], { name: 'nationality' })
  async nationality(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.usersCountry(findOption);
  }
  @UseGuards(AdminGuard)
  @Query(() => [UserAgeRange], { name: 'userAgeCount' })
  async userAgeCount(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.userAgeCount(findOption);
  }
  @UseGuards(AdminGuard)
  @Query(() => UserFunneling, { name: 'userFunnel' })
  async userFunnel(
    @Args('findOptions', { nullable: true }) findOption: AdminDashboardSort,
  ) {
    return await this.adminService.userFunneling(findOption);
  }

  @UseGuards(AdminGuard)
  @Query(() => ResponseTime, { name: 'averageResponse' })
  async averageResponse() {
    return await this.adminService.responseTime();
  }
  @UseGuards(AdminGuard)
  @Query(() => SaiiFees, { name: 'saiiFees' })
  saiiFees(
    @Args('findOptions', { nullable: true }) findOption: AdminDashboardSort,
  ) {
    return this.adminService.saiiFees(findOption);
  }
  @UseGuards(AdminGuard)
  @Query(() => [FinancialVsOrder], { name: 'financialVsOrder' })
  async financialVsOrder(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.financialVsOrder(findOption);
  }
}
