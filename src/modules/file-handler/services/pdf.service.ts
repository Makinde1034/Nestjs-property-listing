/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

import puppeteer from 'puppeteer';
import { PdfInput } from '../dto/pdf.dto';

@Injectable()
export class PdfGeneratorService {
  constructor() {}
  async generateImage(data) {
    const browser = await puppeteer.launch({
      headless: true,

      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote',
      ],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const templateSource = fs.readFileSync(
      path.join(__dirname, '../../', 'mail', 'templates', 'invoice.hbs'),
      'utf8',
    );

    const template = handlebars.compile(templateSource);

    // Render HTML using Handlebars template and data
    const htmlContent = template(data);

    // Set the HTML content for the page
    await page.setContent(htmlContent);
    page.waitForNavigation();
    const image = await page.screenshot();

    // Generate PDF
    //Const pdfBuffer = await page.pdf({ format: 'A4', preferCSSPageSize: true });
    await browser.close();
    return image;
  }

  async generatePdfForInvoice(data: PdfInput): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: 'shell',
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    page.waitForNavigation();

    const templateSource = fs.readFileSync(
      path.join(__dirname, '../../', 'mail', 'templates', 'invoice.hbs'),
      'utf8',
    );
    const template = handlebars.compile(templateSource);

    // Render HTML using Handlebars template and data
    const htmlContent = template(data);

    // Set the HTML content for the page
    await page.setContent(htmlContent);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      preferCSSPageSize: true,
      printBackground: true,
    });
    await browser.close();

    return pdfBuffer;
  }
}
