/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { User } from 'src/entities';

export class RegisterEventDto {
  constructor(public user: User) {
    // Do nothing
  }
}
