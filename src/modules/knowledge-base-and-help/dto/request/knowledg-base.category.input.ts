import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  placement: string;

  @IsOptional()
  @IsString()
  @Field()
  language: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  arabicName: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  englishName: string;
}

export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {
  @Field()
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
