import { Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import { PdfService } from './pdf.service';

@Injectable()
export class ExportService {
  constructor(private readonly pdfService: PdfService) {}

  async generateTable(jsonData: Array<Object>) {
    // Example JSON data
    // const jsonData = [
    //   { name: 'John Doe', age: 28, city: 'New York' },
    //   { name: 'Anna Smith', age: 22, city: 'London' },
    //   { name: 'Peter Jones', age: 35, city: 'Sydney' },
    // ];

    // Get the table headers (keys from the first object in the JSON array)
    const headers = Object.keys(jsonData[0]);
    // Start dynamically building the HTML for the table
    let htmlTable = `
        <html>
        <head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h1>User Information Table</h1>
          <table>
            <thead>
              <tr>`;

    // Dynamically create table headers from JSON keys
    headers.forEach((header) => {
      htmlTable += `<th>${header}</th>`;
    });

    htmlTable += `
              </tr>
            </thead>
            <tbody>`;

    // Dynamically create table rows based on JSON data
    jsonData.forEach((item) => {
      htmlTable += `<tr>`;
      headers.forEach((header) => {
        htmlTable += `<td>${item[header]}</td>`;
      });
      htmlTable += `</tr>`;
    });

    // Close the table
    htmlTable += `
            </tbody>
          </table>
        </body>
        </html>`;

    return htmlTable;
  }

  async generateCsv(jsonData: Array<Object>) {
    // Initialize the json2csv parser
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(jsonData); // Convert JSON to CSV
    return csv;
  }
}
