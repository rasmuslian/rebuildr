import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerException } from 'src/exceptions';
import { Repository } from 'typeorm';
import { File, FileSourceEnum } from '../entities/file.entity';
import { ConfigService } from '@nestjs/config';
import { FileInputType } from 'src/resolvers/product.resolver';
import {
  CmsListImagesInput,
  CmsListImagesResponse,
  CmsUploadFileInput,
  CmsUploadFileResponse,
} from 'src/resolvers/file.resolver';

const SIGNED_URL_EXPIRATION = 3600;
@Injectable()
export class FileService {
  private s3: S3Client;
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService,
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
    } catch {
      throw InternalServerException();
    }
  }

  private spacesBucket = this.configService.get<string>('SPACES_BUCKET');
  private CDNEndpoint = `https://${this.spacesBucket}.ams3.cdn.digitaloceanspaces.com`;
  private nonCDNEndpoint = `https://${this.spacesBucket}.ams3.digitaloceanspaces.com`;

  async findOne(id: string) {
    return await this.fileRepository.findOneBy({ id });
  }

  async createFile(_file: FileInputType, isPrivate?: boolean) {
    const file = new File();
    file.mimeType = _file.mimeType;
    file.private = !!isPrivate;
    file.name = _file.name;
    return await this.fileRepository.save(file);
  }

  async createFiles(_files: FileInputType[], isPrivate?: boolean) {
    return await Promise.all(
      _files.map(async (_file) => await this.createFile(_file, isPrivate)),
    );
  }

  async uploadFile(file: File, publicRead?: boolean): Promise<string> {
    const fileExtension = file.mimeType.split('/')[1];
    const key = file.id + '.' + fileExtension;

    const putCommand = new PutObjectCommand({
      Bucket: this.spacesBucket,
      Key: key,
      ACL: publicRead ? 'public-read' : undefined,
    });

    const signedPutUrl = await getSignedUrl(this.s3, putCommand, {
      expiresIn: SIGNED_URL_EXPIRATION,
    });

    return signedPutUrl;
  }

  async uploadFiles(files: File[], publicRead?: boolean): Promise<string[]> {
    const signedPutUrls = await Promise.all(
      files.map(async (file) => await this.uploadFile(file, publicRead)),
    );
    return signedPutUrls;
  }

  async deleteFiles(files: File[]) {
    //Return if array is empty
    if (!files.length) {
      return;
    }

    const cmd = new DeleteObjectsCommand({
      Bucket: this.spacesBucket,
      Delete: {
        Objects: files.map((file) => ({ Key: file.id })),
      },
    });

    try {
      const response = await this.s3.send(cmd);
      if (response.Errors) {
        //Errors contains errors encountered when deleting objects
        throw new Error();
      }
    } catch {
      throw InternalServerException('Error when deleting files');
    }

    return await this.fileRepository.delete(files.map((f) => f.id));
  }

  async findByProduct(productId: string) {
    return await this.fileRepository.find({
      where: { productImage: { id: productId } },
    });
  }

  async getUrl(file: File) {
    const fileExtension = file.mimeType.split('/')[1];
    const key = file.id + '.' + fileExtension;

    if (file.private) {
      const getCommand = new GetObjectCommand({
        Bucket: this.spacesBucket,
        Key: key,
      });

      const getUrl = await getSignedUrl(this.s3, getCommand, {
        expiresIn: 604800,
      });

      return this.getCDNUrl(getUrl);
    }

    return `${this.CDNEndpoint}/${key}`;
  }

  private getCDNUrl(url: string) {
    return url.replace(this.nonCDNEndpoint, this.CDNEndpoint);
  }

  async cmsUploadFile(
    input: CmsUploadFileInput,
  ): Promise<CmsUploadFileResponse> {
    const images = await Promise.all(
      input.images?.map(async (image) => {
        const file = new File();
        file.mimeType = image.mimeType;
        file.name = image.name;
        file.source = FileSourceEnum.ADMIN;
        return await this.fileRepository.save(file);
      }) ?? [],
    );

    return {
      presignedPutUrls: await this.uploadFiles(images, true),
    };
  }

  async cmsListImages(
    input: CmsListImagesInput,
  ): Promise<CmsListImagesResponse> {
    const pageSize = Number(input.pageSize) || 10;
    const page = Number(input.page) || 0;
    const skip = Math.max(0, pageSize * page);

    const [files, total] = await this.fileRepository.findAndCount({
      where: {
        source: FileSourceEnum.ADMIN,
      },
      take: pageSize,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    return { files, total };
  }
}
