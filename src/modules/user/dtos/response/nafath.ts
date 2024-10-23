/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

export class NafathWebHookResponse {
  response: string;
  status: string;
  transId: string;
  ServiceName: string;
}
@InputType()
export class UserUpgradeInput {
  @Field()
  @IsString()
  idType: string;

  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  phoneNumber: string;
}
@ObjectType()
export class NafathAuthenticationResponseToUser {
  @Field()
  random: string;
}
export interface NafathAuthenticationResponse {
  transId: string;
  random: string;
  test: boolean;
}
export interface NafathUserResponse {
  user_info: Userinfo;
  aud: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
}

export interface Userinfo {
  id: number;
  id_version: number;
  'first_name#ar': string;
  'father_name#ar': string;
  'grand_name#ar': string;
  'family_name#ar': string;
  'first_name#en': string;
  'father_name#en': string;
  'grand_name#en': string;
  'family_name#en': string;
  'two_names#ar': string;
  'two_names#en': string;
  'full_name#ar': string;
  'full_name#en': string;
  gender: string;
  'id_issue_date#g': string;
  'id_issue_date#h': number;
  'id_expiry_date#g': string;
  'id_expiry_date#h': number;
  language: string;
  nationality: number;
  'nationality#ar': string;
  'nationality#en': string;
  'dob#g': string;
  'dob#h': number;
  'card_issue_place#ar': string;
  'card_issue_place#en': string;
}
