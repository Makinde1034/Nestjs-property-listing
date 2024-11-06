import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
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
