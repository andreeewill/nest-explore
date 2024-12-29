import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 } from 'uuid';
import path from 'node:path';

@Injectable()
export class UploadToAwsProvider {
  constructor(private readonly configService: ConfigService) {}

  private generateFileName(file: Express.Multer.File) {
    // Extract file name from file
    const name = file.originalname.split('.')[0];

    // Remove whitespaces
    name.replace(/\s/g, '').trim();

    // Extract extension
    const extension = path.extname(file.originalname);

    // Generate timestamp
    const timestamp = new Date().getTime().toString().trim();

    return `${name}-${timestamp}-${v4()}${extension}`;
  }

  public async fileUpload(file: Express.Multer.File) {
    const s3 = new S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get('appConfig.awsBucketName'),
          Body: file.buffer,
          Key: this.generateFileName(file),
          ContentType: file.mimetype,
        })
        .promise();

      return uploadResult.Key;
    } catch (error) {
      console.error(error);
      throw new RequestTimeoutException(error);
    }
  }
}
