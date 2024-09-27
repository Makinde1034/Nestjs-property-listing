import { addDays } from 'date-fns';
import { Readable } from 'stream';
import { Listing, User } from '../../../entities';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { CreateInvoiceInput } from '../dto/invoice';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { QrCodeService } from '../../file-handler/services/qrcode.service';
import { PdfService } from '../../file-handler/services/pdf.service';
import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../file-handler/services/storage.service';
import { MailgunEmailService } from '../../mail/services/implementations/mailgun.services';
@Injectable()
export class InvoiceService {
  constructor(
    private invoiceRepository: InvoiceRepository,
    private qrcodeService: QrCodeService,
    private pdfGeneratorService: PdfService,
    private storageService: StorageService,
    private mailService: MailgunEmailService,
  ) {}
  logger = new Logger(InvoiceService.name);
  async invoice(data?: PdfInput, user?: User, listing?: Listing) {
    try {
      const qrcode = await this.qrcodeService.generateQrCode('');
      const payload: CreateInvoiceInput = {
        qrcode: qrcode,
        expiredAt: addDays(new Date(), 4),
        price: data.price,
        userId: user.id,
        listingid: listing.id,
      };
      data.item = listing.title;

      const invoice = await this.invoiceRepository.save(payload);
      data.invoiceNumber = invoice.id;
      const invoicePdf =
        await this.pdfGeneratorService.generatePdfForInvoice(data);
      const multerFile: Express.Multer.File = {
        fieldname: invoice.id.toString(),
        originalname: invoice.id.toString(),
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: invoicePdf,
        size: invoicePdf.length,
        stream: Readable.from(invoicePdf),
        destination: '',
        filename: invoice.id.toString(),
        path: '',
      };

      await this.storageService.uploadFile(multerFile);
      await this.mailService.sendEmailInvoice(user, invoicePdf);
      return invoice;
    } catch (error) {
      this.logger.log(error);
    }
  }
}
