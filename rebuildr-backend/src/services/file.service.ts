import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';

@Injectable()
export class FileService {
  private s3: S3Client;
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {
    try {
      this.s3 = new S3Client({
        endpoint: 'https://ams3.digitaloceanspaces.com',
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.SPACES_KEY,
          secretAccessKey: process.env.SPACES_SECRET,
        },
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  async create(mimeType: string) {
    let file = new File();
    file.mimeType = mimeType;
    file = await this.fileRepository.save(file);

    const cmd = new PutObjectCommand({
      Bucket: 'rebuildr-staging',
      Key: file.id,
    });
    const signedUrl = await getSignedUrl(this.s3, cmd, { expiresIn: 3600 });
    return {
      file,
      signedUrl,
    };
  }
}
