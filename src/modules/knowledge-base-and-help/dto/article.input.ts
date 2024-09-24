import { InputType, Int, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateArticleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  image: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  authorImage: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  authorBio: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  language: string;
}

@InputType()
export class UpdateArticleInput extends PartialType(CreateArticleInput) {
  @Field(() => Int)
  id: number;
}
