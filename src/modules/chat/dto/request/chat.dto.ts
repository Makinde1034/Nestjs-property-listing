/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageInput {
  @IsString()
  @IsNotEmpty()
  message: string;
}
