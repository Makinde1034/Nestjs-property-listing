/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export class PdfInput {
  invoiceNumber?: number;
  createdDate: string;
  dueDate: string;
  clientName: string;
  item: string;
  englishName?: string;
  arabicName?: string;
  type: string;
  price: number;
  totalPrice: number;
}
