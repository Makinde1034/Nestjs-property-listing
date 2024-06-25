import { Body, Controller, Post, Res } from '@nestjs/common';
// import { InvoiceService } from '../invoice.service';

@Controller()
export class PaymentController {
  // constructor(private invoiceService: InvoiceService) {}
  // @Post('generate')
  // async generatePdf(
  //   @Body() data: { title: string; content: string },
  //   @Res() res: Response,
  // ) {
  //   const pdfBuffer = await this.invoiceService.generatePdfFromHtml(data);
  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': 'attachment; filename="output.pdf"',
  //   });
  //   res.send(pdfBuffer);
  // }
}
