/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  InputType,
  Int,
  Field,
  PartialType,
  ObjectType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import {
  knowledgeBaseMainPlacement,
  knowledgeBaseNeedHelpPlacement,
} from '../../../../common/enums/knowledge-base';
import { LanguageEnum } from '../../../../common/enums/language.enum';
@InputType()
export class MetaData {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  metadata: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  metadataDescription: string;
}

@InputType()
export class CreateArticleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  image: string;

  @Field(() => MetaData, { nullable: true })
  @IsOptional()
  metadata: MetaData;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum([
    ...Object.values(knowledgeBaseNeedHelpPlacement),
    ...Object.values(knowledgeBaseMainPlacement),
  ])
  placement: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorImage: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  authorBio: string;

  @Field()
  @IsEnum(LanguageEnum)
  language: string;
}

@InputType()
export class UpdateArticleInput extends PartialType(CreateArticleInput) {
  @Field(() => Int)
  @IsNumber()
  id: number;
}
@InputType()
export class ArticleFilterInput extends PaginateAndSort {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  placement: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  published: boolean;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  categoryId: number;

  @Field()
  @IsEnum(LanguageEnum)
  language: string;
}

@InputType()
export class ArticlePublishInput {
  @Field(() => [Number])
  @IsOptional()
  @IsArray()
  id: number[];
}

@InputType()
export class ArticleDeleteInput {
  @Field(() => [Number])
  @IsOptional()
  @IsArray()
  id: number[];
}
