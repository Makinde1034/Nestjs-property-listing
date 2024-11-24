import { Field, ObjectType } from '@nestjs/graphql';
import { Coupon } from '../../../../entities/coupon.entity';
@ObjectType()
export class CouponResponse {
  @Field()
  coupon: Coupon[];
  @Field()
  total: number;
}
