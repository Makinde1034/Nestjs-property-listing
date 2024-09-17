/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum } from 'class-validator';
import { TimePeriodForDashboard } from '../../../../common/enums/sort.enum';

@InputType()
export class AdminDashboardSort {
  @Field({ defaultValue: false })
  @IsOptional()
  @IsEnum(TimePeriodForDashboard)
  timePeriod: string;

  @Field({ defaultValue: false })
  @IsOptional()
  value: number;
}
