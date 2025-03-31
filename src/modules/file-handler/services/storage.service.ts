/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Storage, UploadResponse } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

import { generatereference } from '../../../common/utils/functions';
import StorageConfig from '../../../config/serviceAccount/storage-config';
import slugify from 'slugify';

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
    return new Promise((resolve, reject) => {
      // Ensure filename is sanitized (removes spaces and special characters)
      const name = slugify(this.getFileName(fileData.originalname), {
        lower: true, // Convert to lowercase
        trim: true, // Remove trailing spaces
      });

      const file = this.storage.bucket(this.bucket).file(name);

      const stream = file.createWriteStream();
      stream.on('finish', () => {
        this.logger.log('Stream finished');
        resolve(`${StorageConfig.baseUrl}/${this.bucket}/${name}`);
      });
      stream.on('error', (error) => {
        this.logger.error('Stream error', error);
        reject(error);
      });
      stream.end(fileData.buffer);
    });
  }

  async compressImage(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file provided');
    }

    const compressedBuffer = await sharp(file.buffer)
      .jpeg({ quality: 70 }) // Adjust quality (70% recommended)
      .toBuffer();

    return {
      ...file,
      buffer: compressedBuffer, // Replace original buffer with compressed buffer
    };
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
    const name = slugify(file.path);

    const result = await this.storage
      .bucket(this.bucket)
      .upload(name, { destination });
    return result;
  }

  /**
   * Create file name
   *
   * @param {string} filename
   * @returns {string}
   */
  getFileName(filename: string): string {
    const reference = generatereference() || 'default-reference';
    return `${reference}-${filename}`;
  }
}
