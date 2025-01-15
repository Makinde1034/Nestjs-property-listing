/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Coupon } from '../../../../entities/coupon.entity';
@ObjectType()
export class CouponResponse {
  @Field(() => [Coupon], { nullable: true })
  coupon: Coupon[];
  @Field()
  total: number;
}
@ObjectType()
export class ValidCouponCouponResponse {
  @Field()
  valid: boolean;
  @Field()
  amount: number;
}
