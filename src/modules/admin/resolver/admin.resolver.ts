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

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  AdminDashboardSort,
  UpdateAdminDefaultInput,
} from '../dto/request/admin-request';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminDefault } from '../../../entities/admin-table.entity';
import {
  CreateCouponInput,
  DeactivateCouponInput,
  DeleteCouponInput,
  UpdateCouponInput,
} from '../dto/request/coupons';
import { Coupon } from '../../../entities/coupon.entity';
import { SuccessResponse } from '../../../common/utils/success.response';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
import { Permissions } from 'src/common/decorator/permission';

@Resolver()
@UseGuards(AccessTokenGuard)
export class AdminResolver {
  constructor(private adminService: AdminService) {}
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_LISTINGS_FUNNEL)
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
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_USERS_DEMOGRAPHICS)
  @Query(() => UserDemography, { name: 'totalUser' })
  async totalUser(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.userDemography(findOption);
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_USERS_FUNNEL)
  @Query(() => [UserGenderCount], { name: 'userCount' })
  async userCount(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.userGenderCount(findOption);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_USERS_DEMOGRAPHICS)
  @Query(() => [UserCountryCount], { name: 'nationality' })
  async nationality(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.usersCountry(findOption);
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_USERS_FUNNEL)
  @Query(() => [UserAgeRange], { name: 'userAgeCount' })
  async userAgeCount(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.userAgeCount(findOption);
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_USERS_FUNNEL)
  @Query(() => UserFunneling, { name: 'userFunnel' })
  async userFunnel(
    @Args('findOptions', { nullable: true }) findOption: AdminDashboardSort,
  ) {
    return await this.adminService.userFunneling(findOption);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_SUPPORT_RESPONSE_CARD)
  @Query(() => ResponseTime, { name: 'averageResponse' })
  async averageResponse() {
    return await this.adminService.responseTime();
  }
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_SAII_CARD)
  @Query(() => SaiiFees, { name: 'saiiFees' })
  saiiFees(
    @Args('findOptions', { nullable: true }) findOption: AdminDashboardSort,
  ) {
    return this.adminService.saiiFees(findOption);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_REVENUE_CARD)
  @Query(() => [FinancialVsOrder], { name: 'financialVsOrder' })
  async financialVsOrder(@Args('findOptions') findOption: AdminDashboardSort) {
    return await this.adminService.financialVsOrder(findOption);
  }

  /************************************
   * Coupons
   ************************************/

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.COUPONS_CREATE)
  @Mutation(() => Coupon, { name: 'createCoupon' })
  async createCoupon(
    @Args('createCouponsInput') createCouponsInput: CreateCouponInput,
    @Context() ctx: any,
  ) {
    return await this.adminService.createCoupon(
      createCouponsInput,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_EDIT)
  @Mutation(() => AdminDefault, { name: 'updateAdminDefault' })
  async updateAdminDefault(
    @Args('updateAdminDefaultInput')
    updateAdminDefaultInput: UpdateAdminDefaultInput,
  ) {
    return await this.adminService.updateSystemSetting(updateAdminDefaultInput);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_EDIT)
  @Mutation(() => AdminDefault, { name: 'updateAuctionBidRangeSetting' })
  async updateAuctionBidRangeSetting(
    @Args('createCouponsInput')
    updateAdminDefaultInput: UpdateAdminDefaultInput,
  ) {
    return await this.adminService.updateAuctionBidRangeSetting(
      updateAdminDefaultInput,
    );
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.COUPONS_VIEW)
  @Query(() => [Coupon], { name: 'fetchCoupons' })
  async fetchCoupons() {
    return await this.adminService.fetchCoupons();
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.COUPONS_EDIT)
  @Mutation(() => Coupon, { name: 'updateCoupon' })
  async updateCoupons(
    @Args('updateCouponsInput') updateCouponsInput: UpdateCouponInput,
    @Context() ctx: any,
  ) {
    return await this.adminService.updateCoupon(
      updateCouponsInput,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.COUPONS_DELETE)
  @Mutation(() => SuccessResponse, { name: 'deleteCoupons' })
  async deleteCoupons(
    @Args('deleteCouponsInput') deleteCouponsInput: DeleteCouponInput,
    @Context() ctx: any,
  ) {
    return await this.adminService.deleteCoupon(
      deleteCouponsInput,
      ctx.req.user,
    );
  }

  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.COUPONS_CHANGE_STATUS)
  @Mutation(() => SuccessResponse, { name: 'deactivateCoupons' })
  async deactivateCoupons(
    @Args('deactivateCoupons') deactivateCouponsInput: DeactivateCouponInput,
    @Context() ctx: any,
  ) {
    return await this.adminService.deactivateCoupon(
      deactivateCouponsInput,
      ctx.req.user,
    );
  }
}
