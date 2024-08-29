/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RestAccessTokenGuard } from '../../auth/guards';
import { UserService } from '../services/user.service';
import { ImageDataResponse } from '../dtos/request';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Upload User Profile Picture
   *
   * @async
   * @param {Express.Multer.File} image
   * @returns {Promise<UserDetailsResponse>}
   */
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(RestAccessTokenGuard)
  @Post('/profile/picture')
  async updateTaskerProfilePicture(
    @Request() req,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ImageDataResponse> {
    return {
      data: await this.userService.updateProfilePicture(req.user, image),
    };
  }
}
