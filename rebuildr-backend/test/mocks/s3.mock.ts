/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Mock {
  upload(key: string, publicRead?: boolean): Promise<string> {
    return Promise.resolve('upload url');
  }
  deleteFiles(keys: string[]): Promise<void> {
    return Promise.resolve();
  }
  getUrl(key: string, isPrivate?: boolean): Promise<string> {
    return Promise.resolve('get url');
  }
}
