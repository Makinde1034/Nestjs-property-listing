/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Storage, UploadResponse } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import StorageConfig from './storage-config';
import { generatereference } from 'src/common/utils/functions';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage({
      projectId: StorageConfig.projectId,
      credentials: {
        client_email: StorageConfig.client_email,
        private_key: StorageConfig.private_key,
      },
    });

    this.bucket = StorageConfig.mediaBucket;
  }

  /**
   * Upload Basic File
   *
   * @async
   * @param {Express.Multer.File} fileData
   * @returns {Promise<string>}
   */
  async upload(fileData: Express.Multer.File): Promise<string> {
    await new Promise(() => {
      const name = this.getFileName(fileData.filename);
      const file = this.storage.bucket(this.bucket).file(name);
      const stream = file.createWriteStream();
      stream.on('finish', () => {
        this.logger.log('stream Finished');
      });
      stream.on('error', (error) => {
        this.logger.error('stream error', error);
        return error;
      });
      stream.end(fileData.buffer);
    });
    return `${StorageConfig.baseUrl}/${StorageConfig.mediaBucket}/${name}`;
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
