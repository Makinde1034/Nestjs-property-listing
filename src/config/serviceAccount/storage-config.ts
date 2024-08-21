/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { config } from 'dotenv';

config();

const StorageConfig = {
  projectId: process.env.GC_PROJECT_ID,
  bucketName: process.env.GC_BUCKET_NAME,
  baseUrl: process.env.GC_BUCKET_URL,
  privateKeyId: process.env.GC_PRIVATE_KEY_ID,
  privateKey: process.env.GC_PRIVATE_KEY
    ? process.env.GC_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
  clientEmail: process.env.GC_CLIENT_EMAIL,
  clientID: process.env.GC_CLIENT_ID,
};

export default StorageConfig;
