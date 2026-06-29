import { Injectable } from '@nestjs/common';
import { AIService } from './ai.service';

/**
 * Inventory import: turns uploaded photos or a product list (CSV/spreadsheet
 * rows / text) into internal listings (Product, visibility=INTERNAL) in the
 * user's company internal inventory, via the AI service. No separate storage —
 * the internal inventory is just internal Products, read via the products query.
 */
@Injectable()
export class InventoryService {
  constructor(private aiService: AIService) {}

  /** Base64 photos -> internal Products (uploaded photo used as the image). */
  async aiImportFromImages(images: string[], sellerId: string) {
    return this.aiService.analyzeInventoryFromImages(images, sellerId);
  }

  /**
   * A product list document (CSV or Excel) -> internal Products (with generated
   * catalogue images, since the list has no images). Excel is parsed to CSV.
   */
  async aiImportFromDocument(
    fileBase64: string,
    mimeType: string,
    sellerId: string,
  ) {
    const buffer = Buffer.from(
      fileBase64.replace(/^data:[^,]+,/, ''),
      'base64',
    );
    let text: string;
    if (/sheet|excel|xls/i.test(mimeType)) {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buffer, { type: 'buffer' });
      text = wb.SheetNames.map((name) =>
        XLSX.utils.sheet_to_csv(wb.Sheets[name]),
      ).join('\n');
    } else {
      text = buffer.toString('utf8');
    }
    return this.aiService.analyzeInventoryFromText(text, sellerId);
  }
}
