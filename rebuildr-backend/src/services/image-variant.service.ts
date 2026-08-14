import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Like, Repository } from 'typeorm';
import sharp from 'sharp';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { File } from '../entities/file.entity';
import { S3Service } from './s3.service';

// WebP variant widths generated for every public image, stored as
// `${id}_${width}.webp`. Also used by FileService.getUrl to resolve url(width).
export const VARIANT_WIDTHS = [200, 400, 800];
const WEBP_QUALITY = 75;
// Images processed per sweep tick (sharp is CPU-heavy — keep the batch modest).
const BATCH_SIZE = 10;
// Wait a bit before processing so the client's direct-to-Spaces upload finished.
const MIN_AGE_MS = 2 * 60_000;

/**
 * Generates responsive WebP variants for public images and stores them in
 * Spaces. Runs as a periodic sweep (not an upload hook) because uploads go
 * client → Spaces via presigned URLs, so the backend never sees the bytes at
 * upload time. The sweep picks up anything with hasVariants=false.
 */
@Injectable()
export class ImageVariantService {
  private running = false;

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly s3Service: S3Service,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sweep(): Promise<void> {
    if (this.running) return; // never overlap ticks
    this.running = true;
    try {
      const files = await this.fileRepository.find({
        where: {
          hasVariants: false,
          private: false,
          mimeType: Like('image/%'),
          createdAt: LessThan(new Date(Date.now() - MIN_AGE_MS)),
        },
        order: { createdAt: 'ASC' },
        take: BATCH_SIZE,
      });
      for (const file of files) {
        await this.generate(file);
      }
    } catch (e) {
      this.logger.error('ImageVariantService.sweep failed', {
        error: e instanceof Error ? e.message : e,
      });
    } finally {
      this.running = false;
    }
  }

  async generate(file: File): Promise<void> {
    const ext =
      file.mimeType === 'image/jpeg' &&
      file.name?.startsWith('kategori-') &&
      file.name.endsWith('.jpg')
        ? 'jpg'
        : file.mimeType.split('/')[1];
    const key = `${file.id}.${ext}`;
    try {
      const url = await this.s3Service.getUrl(key); // public CDN url
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`origin returned ${res.status} for ${key}`);
      }
      const input = Buffer.from(await res.arrayBuffer());

      for (const width of VARIANT_WIDTHS) {
        const webp = await sharp(input)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
        await this.s3Service.putBuffer(
          `${file.id}_${width}.webp`,
          webp,
          'image/webp',
          true,
        );
      }

      // Only flag as done once every variant is uploaded, so url(width) never
      // resolves to a variant that doesn't exist yet.
      file.hasVariants = true;
      await this.fileRepository.save(file);
    } catch (e) {
      // Leave hasVariants=false → retried next tick (original URL served
      // meanwhile). Logged for visibility.
      this.logger.warn('ImageVariantService.generate failed', {
        fileId: file.id,
        error: e instanceof Error ? e.message : e,
      });
    }
  }
}
