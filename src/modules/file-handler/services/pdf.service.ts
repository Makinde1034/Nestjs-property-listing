/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { PdfInput } from '../dto/pdf.dto';

@Injectable()
export class PdfGeneratorService {
  constructor() {}
  logger = new Logger(PdfGeneratorService.name);
  async generateImage(data): Promise<Buffer> {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const templateSource = fs.readFileSync(
      path.join(__dirname, '../../', 'mail', 'templates', 'invoice.hbs'),
      'utf8',
    );

    const template = handlebars.compile(templateSource);
    const htmlContent = template(data);

    await page.setContent(htmlContent);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const image = await page.screenshot();
    await browser.close();

    return image;
  }

  async generatePdfForInvoice(data: PdfInput): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome-stable',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(0);

      const templateSource = fs.readFileSync(
        path.join(__dirname, '../../', 'mail', 'templates', 'invoice.hbs'),
        'utf8',
      );

      const template = handlebars.compile(templateSource);
      const htmlContent = template(data);

      await page.setContent(htmlContent);
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        preferCSSPageSize: true,
        printBackground: true,
      });

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      this.logger.log(error);
    }
  }
}
