import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
@InputType()
export class FinalizationInput {
  @Field()
  @IsOptional()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sellerZatca: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sellerIban: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sellerBirthDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  ownershipAmmount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  buyerZatca: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  buyerIban: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  buyerBirthDate: string;
}
