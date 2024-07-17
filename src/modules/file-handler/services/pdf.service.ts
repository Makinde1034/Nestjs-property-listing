/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { PdfInput } from '../dto/pdf.dto';

@Injectable()
export class PdfService {
  async pdfGeneratorService(data: PdfInput): Promise<Buffer> {
    const templatePath = path.join(
      __dirname,
      '../../',
      'mail',
      'templates',
      'invoice.hbs',
    );
    const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(htmlTemplate);
    const html = template(data);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return pdfBuffer;
  }
}
