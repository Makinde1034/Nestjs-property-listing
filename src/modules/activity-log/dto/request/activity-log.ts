import { Field, InputType } from '@nestjs/graphql';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';

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

@InputType()
export class AuditLogTrailsInput extends PaginateAndSort {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userName: string;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  minDate: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  maxDate: Date;
}
