import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerException, ForbiddenException } from 'src/exceptions';
import { Repository } from 'typeorm';
import { File, FileSourceEnum } from '../entities/file.entity';
import { FileInputType } from 'src/resolvers/product.resolver';
import {
  CmsListImagesInput,
  CmsListImagesResponse,
  CmsUploadFileInput,
  CmsUploadFileResponse,
} from 'src/resolvers/file.resolver';
import { S3Service } from './s3.service';
@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private s3Service: S3Service,
  ) {}

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

    return await this.s3Service.upload(key, publicRead);
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

    const ids = files.map((file) => file.id);

    try {
      await this.s3Service.deleteFiles(ids);
    } catch {
      throw InternalServerException('Error when deleting files');
    }

    return await this.fileRepository.delete(ids);
  }

  async findByProduct(productId: string) {
    return await this.fileRepository.find({
      where: { productImage: { id: productId } },
    });
  }

  async getUrl(file: File) {
    const fileExtension = file.mimeType.split('/')[1];
    const key = file.id + '.' + fileExtension;
    return await this.s3Service.getUrl(key, file.private);
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

  async cmsDeleteFile(imageId: string) {
    const file = await this.findOne(imageId);

    if (file.source !== FileSourceEnum.ADMIN) {
      throw ForbiddenException();
    }

    try {
      await this.deleteFiles([file]);
      await this.fileRepository.delete([imageId]);

      return file;
    } catch {
      throw InternalServerException('Error when deleting files');
    }
  }
}
