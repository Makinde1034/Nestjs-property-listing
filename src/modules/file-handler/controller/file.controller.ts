import {
  Body,
  Controller,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ExportService } from '../services/export.service';
import { RestAccessTokenGuard } from '../../auth/guards';

import { Readable } from 'stream';
import { Public } from '../../auth/decorators/permision.decorator';

@Controller()
export class FileController {
  constructor(private readonly exportService: ExportService) {}
  @UseGuards(RestAccessTokenGuard)
  @Post('export/csv')
  @Public()
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

  @Public()
  @UseGuards(RestAccessTokenGuard)
  @Post('export/pdf')
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
