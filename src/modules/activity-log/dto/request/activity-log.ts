import { Field, InputType } from '@nestjs/graphql';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class ActivityLogInput extends PaginateAndSort {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  @IsOptional()
  fieldToFilter: string;
}
