import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Like, Repository } from 'typeorm';
import sharp from 'sharp';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { File } from '../entities/file.entity';
import { S3Service } from './s3.service';

// WebP variant widths generated for every public image. Uploads are already
// capped at ~800px client-side (rebuildr-app useOptimizeImage), so we only ever
// scale down. Keys follow the convention `${id}_${width}.webp`.
const VARIANT_WIDTHS = [200, 400, 800];
const WEBP_QUALITY = 75;
// Images processed per sweep tick (sharp is CPU-heavy — keep the batch modest).
const BATCH_SIZE = 10;
// Wait a bit before processing so the client's direct-to-Spaces upload finished.
const MIN_AGE_MS = 2 * 60_000;

/**
 * Generates responsive WebP variants for public images and stores them in
 * Spaces. Because uploads go client → Spaces via presigned URLs, the backend
 * never sees the bytes at upload time, so this runs as a periodic sweep instead
 * of a synchronous hook. The same sweep also drains the historical backlog (all
 * pre-existing files default to hasVariants=false), so no separate backfill is
 * needed. The frontend only requests variant URLs when File.hasVariants is true.
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
    const ext = file.mimeType.split('/')[1];
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

      // Only flag as done once every variant is uploaded, so the frontend never
      // requests a variant URL that 404s.
      file.hasVariants = true;
      await this.fileRepository.save(file);
    } catch (e) {
      // Leave hasVariants=false → retried next tick; the frontend serves the
      // original in the meantime. Logged for visibility.
      this.logger.warn('ImageVariantService.generate failed', {
        fileId: file.id,
        error: e instanceof Error ? e.message : e,
      });
    }
  }
}
