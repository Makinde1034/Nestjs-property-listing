/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { User } from 'src/entities';

export interface StaffCreatedData {
  staff: User;
  password: string;
}

export class StaffCreatedEventDto {
  constructor(public data: StaffCreatedData) {}
}
