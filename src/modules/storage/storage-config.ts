/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

const StorageConfig = {
  projectId: process.env.STORAGE_PROJECT_ID,
  keyFileName: process.env.STORAGE_KEY_FILE_NAME,
  bucketName: process.env.STORAGE_BUCKET_NAME,
  baseUrl: process.env.STORAGE_BUCKET_URL,
};

export default StorageConfig;
