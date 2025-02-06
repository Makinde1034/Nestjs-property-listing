import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceAndProviderService } from '../services/service-provider.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadWorkDocument } from '../dto/service';
@Controller('service-provider')
export class ServiceProviderController {
  constructor(private serviceProviderService: ServiceAndProviderService) {}

  logger = new Logger(ServiceAndProviderService.name);

  @Post('upload-document')
  @UseInterceptors(FileInterceptor('icon'))
  async uploadWorkPermit(
    @Query() input: UploadWorkDocument,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    return await this.serviceProviderService.uploadWorkDocument(
      input.serviceProviderId,
      icon,
      input.documentType,
    );
  }
}
