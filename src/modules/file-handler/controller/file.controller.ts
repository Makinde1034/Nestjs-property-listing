import {
  Body,
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ExportService } from '../services/export.service';
import { RestAccessTokenGuard } from '../../auth/guards';

import { Readable } from 'stream';

@Controller()
export class FileController {
  constructor(private readonly exportService: ExportService) {}
  @UseGuards(RestAccessTokenGuard)
  @Get('export/csv')
  async exportToCsv(
    @Query('name') name: string,
    @Body() payload: Array<Object>,
  ): Promise<StreamableFile> {
    const csv = await this.exportService.generateCsv(payload);

    const stream = new Readable();
    stream.push(csv);
    stream.push(null);

    return new StreamableFile(stream, {
      type: 'application/csv',
      disposition: `attachment; filename=${name}.csv`,
    });
  }

  @UseGuards(RestAccessTokenGuard)
  @Get('export/pdf')
  async exportToPdf(
    @Query('name') name: string,
    @Body() payload: Array<Object>,
  ): Promise<StreamableFile> {
    const pdf = await this.exportService.generateTable(payload);

    const stream = new Readable();
    stream.push(pdf);
    stream.push(null);

    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `attachment; filename=${name}.pdf`,
    });
  }
}
