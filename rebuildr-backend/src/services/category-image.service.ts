import { GoogleGenAI, Part } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { readFile, readdir } from 'fs/promises';
import { extname, join } from 'path';

import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';
import { FileService } from 'src/services/file.service';
import { S3Service } from 'src/services/s3.service';

const REFERENCE_DIRECTORY = join(
  __dirname,
  '../assets/category-image-references',
);
const VALID_REFERENCE_EXTENSIONS = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
]);
const VALID_OUTPUT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

@Injectable()
export class CategoryImageService {
  private readonly gemini = new GoogleGenAI({});

  constructor(
    private readonly fileService: FileService,
    private readonly s3Service: S3Service,
  ) {}

  async generate(category: Category, parent?: Category | null): Promise<File> {
    const references = await this.readReferences();
    if (!references.length) {
      throw new Error('Inga bildreferenser har konfigurerats');
    }

    const response = await this.gemini.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: [
        {
          parts: [
            ...references,
            {
              text: `Skapa en kvadratisk kategoribild för RebuildR, en svensk marknadsplats för återbrukat byggmaterial.\nKategori: ${category.name}\nHuvudkategori: ${parent?.name ?? 'Ingen'}\nBeskrivning: ${category.description}\n\nAnvänd referensbilderna endast som stilreferens. Bilden ska tydligt representera den här kategorin, ha samma rena, konsekventa visuella stil och fungera i en liten kategoriruta. Ingen text, inga bokstäver, inga siffror, inga logotyper, inga vattenstämplar och inga produktetiketter.`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    const inlineData = response.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .find(
        (part) => part.inlineData?.data && part.inlineData.mimeType,
      )?.inlineData;

    if (!inlineData?.data || !inlineData.mimeType) {
      throw new Error('Bildmodellen returnerade ingen bild');
    }
    if (!VALID_OUTPUT_MIME_TYPES.has(inlineData.mimeType)) {
      throw new Error('Bildmodellen returnerade ett ogiltigt bildformat');
    }

    // FileService derives the object key extension from the MIME subtype.
    // Keep JPEG as `.jpeg` rather than the common `.jpg` alias, otherwise
    // generated images are stored under a key FileService can never read.
    const extension = inlineData.mimeType.split('/')[1];
    const file = await this.fileService.createFile({
      mimeType: inlineData.mimeType,
      name: `kategori-${category.name}.${extension}`,
    });
    await this.s3Service.putBuffer(
      `${file.id}.${extension}`,
      Buffer.from(inlineData.data, 'base64'),
      inlineData.mimeType,
      true,
    );
    return file;
  }

  private async readReferences(): Promise<Part[]> {
    let names: string[];
    try {
      names = await readdir(REFERENCE_DIRECTORY);
    } catch {
      return [];
    }

    return Promise.all(
      names.flatMap(async (name) => {
        const mimeType = VALID_REFERENCE_EXTENSIONS.get(
          extname(name).toLowerCase(),
        );
        if (!mimeType) return [];
        const data = await readFile(join(REFERENCE_DIRECTORY, name));
        return [{ inlineData: { data: data.toString('base64'), mimeType } }];
      }),
    ).then((parts) => parts.flat());
  }
}
