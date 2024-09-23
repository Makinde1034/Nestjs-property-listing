/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageInput {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  attachment: string;
}
