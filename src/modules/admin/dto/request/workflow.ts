import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
@InputType()
export class CreateWorkflowInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  document: string;

  @Field()
  @IsBoolean()
  isActive: boolean;

  @Field()
  @IsNumber()
  numberOfApproval: number;

  @Field(() => Array)
  @IsArray()
  approvalOneRole: string[];

  @Field(() => Array)
  @IsArray()
  approvalTwoRole: string[];
}

@InputType()
export class UpdateWorkflowInput extends PartialType(CreateWorkflowInput) {
  @Field()
  id: string;
}

@InputType()
export class WorkflowInputFilter extends PaginateAndSort {}
