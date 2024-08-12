import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';

const SIGNED_URL_EXPIRATION = 3600;
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
    const signedUrl = await getSignedUrl(this.s3, cmd, {
      expiresIn: SIGNED_URL_EXPIRATION,
    });
    return {
      file,
      signedUrl,
    };
  }

  async deleteMany(files: File[]) {
    //Return if array is empty
    if (!files.length) {
      return;
    }

    const cmd = new DeleteObjectsCommand({
      Bucket: 'rebuildr-staging',
      Delete: {
        Objects: files.map((file) => ({ Key: file.id })),
      },
    });

    try {
      const response = await this.s3.send(cmd);
      if (response.Errors) {
        //Errors contains errors encountered when deleting objects
        throw new Error('Error when deleting objects');
      }
    } catch (e) {
      throw new Error(e);
    }

    return await this.fileRepository.delete(files.map((f) => f.id));
  }

  async findByProduct(productId: string) {
    return await this.fileRepository.findBy({ productId });
  }

  async findOneByProduct(productId: string) {
    return await this.fileRepository.findOneBy({ productId });
  }

  async getPresignedGetUrl(fileId: string) {
    const cmd = new GetObjectCommand({
      Bucket: 'rebuildr-staging',
      Key: fileId,
    });

    return await getSignedUrl(this.s3, cmd, {
      expiresIn: SIGNED_URL_EXPIRATION,
    });
  }
}
