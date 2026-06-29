/**
 * DEV/LOCAL ONLY — exercise the real Gemini inventory analysis on local image
 * or PDF files (no S3 / Spaces involved). Creates internal listings (Product,
 * visibility=INTERNAL) owned by the given user's company in the local database.
 *
 * Usage (from rebuildr-backend):
 *   op run --env-file=".env.local.1p" -- \
 *     node -r ts-node/register -r tsconfig-paths/register \
 *     scripts/analyze-local-inventory.ts <sellerUserId> <imagePath...>
 *
 * Use sparingly — each run calls the Gemini API.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { AIService } from 'src/services/ai.service';

async function main() {
  const [sellerId, ...files] = process.argv.slice(2);
  if (!sellerId || files.length === 0) {
    console.error(
      'Usage: analyze-local-inventory.ts <sellerUserId> <imagePath...>',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const ai = app.get(AIService);
    const isText = files.every((f) => /\.(csv|txt)$/i.test(f));
    console.log(
      `Analyserar ${files.length} ${isText ? 'lista/CSV' : 'bild'}-fil(er) för användare ${sellerId} ...`,
    );
    let products;
    if (isText) {
      const fs = await import('fs/promises');
      const text = (
        await Promise.all(files.map((f) => fs.readFile(f, 'utf8')))
      ).join('\n');
      products = await ai.analyzeInventoryFromText(text, sellerId);
    } else {
      products = await ai.analyzeInventoryFromLocalFiles(files, sellerId);
    }
    console.log(`\nGemini skapade ${products.length} intern annons(er):\n`);
    console.log(
      JSON.stringify(
        products.map((p) => ({
          title: p.title,
          condition: p.condition,
          quantity: p.primaryQuantity,
          unit: p.primaryUnit,
          priceSuggestion: [p.priceSuggestionMin, p.priceSuggestionMax],
          categoryId: p.categoryId,
          visibility: p.visibility,
          organizationId: p.organizationId,
        })),
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
