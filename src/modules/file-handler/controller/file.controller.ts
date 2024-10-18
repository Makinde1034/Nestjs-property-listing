import { Controller, Get, Res } from '@nestjs/common';
import { ExportService } from '../services/export.service';

@Controller()
export class FileController {
  constructor(private readonly exportService: ExportService) {}

  @Get('export/csv')
  async exportToCsv(data: Array<Object>) {
    return await this.exportService.generateCsv(data);
  }

  @Get('export/pdf')
  async exportToPdf(@Res() data: Object) {
    return await this.exportToPdf(data);
  }
}
