import { Field, ObjectType } from '@nestjs/graphql';
import { Coupon } from '../../../../entities/coupon.entity';
@ObjectType()
export class CouponResponse {
  @Field(() => [Coupon])
  coupon: Coupon[];
  @Field()
  total: number;
}
@ObjectType()
export class ValidCouponCouponResponse {
  @Field(() => [Coupon])
  valid: boolean;
  @Field()
  amount: number;
}
