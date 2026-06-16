import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InternalServerException, ForbiddenException } from 'src/exceptions';
import { Repository, In, ILike } from 'typeorm';
import { File } from 'src/entities/file.entity';
import { FileInputType } from 'src/resolvers/file.resolver';
import {
  CmsListFilesInput,
  CmsListFilesResponse,
  CmsCreateFilesInput,
  CmsCreateFilesResponse,
} from 'src/resolvers/file.resolver';
import { S3Service } from './s3.service';
import { FileType, FileSourceEnum } from 'src/constants/enums';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private s3Service: S3Service,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
    //S3 objects are stored with the file extension in the key (see
    //uploadFile: `${id}.${ext}`) — deleting by bare id never matched
    const keys = files.map(
      (file) => `${file.id}.${file.mimeType.split('/')[1]}`,
    );

    try {
      await this.s3Service.deleteFiles(keys);
    } catch (e) {
      //A failed storage cleanup must never block the user action (deleting a
      //draft/product). Orphaned objects are logged and can be swept later.
      this.logger.error('S3 cleanup failed, continuing with db delete', {
        error: e instanceof Error ? e.message : e,
        keys,
      });
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

  async cmsCreateFiles(
    input: CmsCreateFilesInput,
  ): Promise<CmsCreateFilesResponse> {
    const images = await Promise.all(
      input.files?.map(async (image) => {
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

  async cmsListFiles(input: CmsListFilesInput): Promise<CmsListFilesResponse> {
    const { pageSize = 10, page = 0, searchString = '', fileType } = input;
    const skip = Math.max(0, pageSize * page);

    const imageMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const documentMimeTypes = ['application/pdf', 'text/plain'];

    const [files, total] = await this.fileRepository.findAndCount({
      where: {
        source: FileSourceEnum.ADMIN,
        mimeType:
          fileType === FileType.IMAGE
            ? In(imageMimeTypes)
            : In(documentMimeTypes),
        name: ILike(`%${searchString}%`),
      },

      take: pageSize,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    return { files, total };
  }

  async cmsDeleteFile(id: string) {
    const file = await this.findOne(id);

    if (file.source !== FileSourceEnum.ADMIN) {
      throw ForbiddenException();
    }

    try {
      await this.deleteFiles([file]);
      await this.fileRepository.delete([id]);

      return file;
    } catch {
      throw InternalServerException('Error when deleting files');
    }
  }
}
