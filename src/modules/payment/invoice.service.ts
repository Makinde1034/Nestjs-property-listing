// // src/pdf-generator/pdf-generator.service.ts
// import { Injectable } from '@nestjs/common';
// import * as playwright from 'playwright';
// import * as handlebars from 'handlebars';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class InvoiceService {
//   async generatePdfFromHtml(data: {
//     title: string;
//     content: string;
//   }): Promise<Buffer> {
//     // Load and compile the Handlebars template
//     try {
//       const templatePath = path.resolve(
//         __dirname,
//         '..',
//         'templates',
//         'template.hbs',
//       );
//       const templateFile = fs.readFileSync(templatePath, 'utf8');
//       const template = handlebars.compile(templateFile);

//       // Render HTML using the template and data
//       const html = template(data);

//       // Generate PDF using Playwright
//       const browser = await playwright.chromium.launch();
//       const page = await browser.newPage();
//       await page.setContent(html, { waitUntil: 'networkidle' });
//       const pdfBuffer = await page.pdf();
//       await browser.close();

//       return pdfBuffer;
//     } catch (error) {
//       throw new In();
//     }
//   }
// }
