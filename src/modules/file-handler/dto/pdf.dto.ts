/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export class PdfInput {
  invoiceNumber?: number;
  createdDate?: string;
  qrcode?: string;
  sellerCRNumber?: string;
  sellerzatcaNumber?: string;
  sellerAddress?: string;
  sellerName?: string;
  customerCRNumber?: string;
  customerName?: string;
  customerAddress?: string;
  customerZatcaNumber?: string;
  totalWithVat?: [number];
  itemVat?: [VatItem];
  product?: unknown;
  sumTotalWithoutVat?: number;
  sumTotalVat?: number;
  sumTotalWithVat?: number;
}

export interface VatItem {
  vat: number;
  vatValue: number;
}
