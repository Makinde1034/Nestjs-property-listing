import { Field, InputType } from '@nestjs/graphql';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { CouponEnum } from '../../../../common/enums/coupons.enum';

@InputType()
export class CreateCouponsInput {
  @Field()
  @IsString()
  code: string;

  @Field()
  @IsNumber()
  maxUse: number;

  @Field()
  @IsEnum(CouponEnum)
  discountType: string;

  @Field()
  @IsNumber()
  @IsPositive()
  discoutValue: number;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsDate()
  endDate: Date;
}
