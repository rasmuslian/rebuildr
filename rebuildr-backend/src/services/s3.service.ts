import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { InternalServerException } from 'src/exceptions';
import { ConfigService } from '@nestjs/config';

const SIGNED_URL_EXPIRATION = 3600;
@Injectable()
export class S3Service {
  private s3: S3Client;
  constructor(private configService: ConfigService) {
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

  async upload(key: string, publicRead?: boolean): Promise<string> {
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

  async deleteFiles(keys: string[]) {
    //Return if array is empty
    if (!keys.length) {
      return;
    }

    const cmd = new DeleteObjectsCommand({
      Bucket: this.spacesBucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    try {
      const response = await this.s3.send(cmd);
      if (response.Errors) {
        //Errors contains errors encountered when deleting objects
        throw new Error();
      }
    } catch {
      throw InternalServerException('Error when deleting S3 objects');
    }
  }

  async getUrl(key: string, isPrivate?: boolean) {
    if (isPrivate) {
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
}
