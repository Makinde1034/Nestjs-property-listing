import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UserProfileTypeEnum } from 'src/common/enums';
import { UserProfileType } from 'src/common/types';
import { companyInput } from './CompanyInput';
import { Type } from 'class-transformer';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty()
  @IsEnum(UserProfileTypeEnum)
  userType: UserProfileType;

  @Field()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(null, { message: 'This field must be a valid phone number' })
  phone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @Field(() => companyInput, { nullable: true })
  @ValidateNested()
  @Type(() => companyInput)
  @ValidateIf((o) => o.userType === UserProfileTypeEnum.COMPANY)
  company: companyInput;
}
