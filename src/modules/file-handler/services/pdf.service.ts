/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { PdfInput } from '../dto/pdf.dto';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePdfForInvoice(data: PdfInput): Promise<Buffer> {
    try {
      // Load and compile the Handlebars template
      const templatePath = path.join(
        __dirname,
        '../../',
        'mail',
        'templates',
        'english-payment-invoice.hbs',
      );

      const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(htmlTemplate);
      const html = template(data);

      this.logger.log('PDF generated successfully');
      return await this.generatePdf(html);
    } catch (error) {
      this.logger.error('Error generating PDF', error);
      throw new Error('Error generating PDF'); // Throwing an error to handle it properly in the caller
    }
  }

  async generatePdf(html: string): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        protocol: 'webDriverBiDi',
        executablePath: '/usr/bin/firefox',
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      // 🔥 Convert Uint8Array to Buffer
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generating PDF', error);
      throw new Error('Error generating PDF');
    }
  }
}
