/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Staff } from 'src/entities';

export interface StaffCreatedData {
  staff: Staff;
  password: string;
}

export class StaffCreatedEventDto {
  constructor(public data: StaffCreatedData) {}
}
