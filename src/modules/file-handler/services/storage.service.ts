/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Storage, UploadResponse } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import StorageConfig from '../../../database/seeders/config/serviceAccount/storage-config';
import { generatereference } from 'src/common/utils/functions';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage({
      projectId: StorageConfig.projectId,
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
      credentials: {
        client_email: StorageConfig.clientEmail,
        private_key: StorageConfig.privateKey,
        client_id: StorageConfig.clientID,
        private_key_id: StorageConfig.privateKeyId,
      },
    });

    this.bucket = StorageConfig.bucketName;
  }

  /**
   * Upload Basic File
   *
   * @async
   * @param {Express.Multer.File} fileData
   * @returns {Promise<string>}
   */
  async upload(fileData: Express.Multer.File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const name = this.getFileName(fileData.originalname);
      const file = this.storage.bucket(this.bucket).file(name);
      const stream = file.createWriteStream();
      stream.on('finish', () => {
        this.logger.log('stream Finished');
        resolve(`${StorageConfig.baseUrl}/${this.bucket}/${name}`);
      });
      stream.on('error', (error) => {
        this.logger.error('stream error', error);
        reject(error);
      });
      stream.end(fileData.buffer);
    });
  }

  async delete(path: string) {
    await this.storage
      .bucket(this.bucket)
      .file(path)
      .delete({ ignoreNotFound: true });
  }

  /**
   * Upload File
   *
   * @async
   * @param {Express.Multer.File} file
   * @returns {Promise<UploadResponse>}
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadResponse> {
    const destination = this.getFileName(file.filename);
    const result = await this.storage
      .bucket(this.bucket)
      .upload(file.path, { destination });
    return result;
  }

  /**
   * Create file name
   *
   * @param {string} filename
   * @returns {string}
   */
  getFileName(filename: string): string {
    return `${generatereference()}-${filename}`;
  }
}
