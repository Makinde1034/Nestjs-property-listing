/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { File } from 'buffer';

export class MailInput {
  name?: string;
  email?: string;
  subject?: string;
  type?: string;
  text?: string;
  file?: File;
}
