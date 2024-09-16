import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsDate } from 'class-validator';
@InputType()
export class CreateSplashScreenInput {
  @Field()
  @IsBoolean()
  default: boolean;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsDate()
  endDate: Date;
}
export class UpdateSplashScreenInput extends PartialType(
  CreateSplashScreenInput,
) {
  @Field()
  id: string;
}
