import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from '../upload.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadFile } from '../interfaces/upload-file.interface';
import { fileTypes } from '../enums/file-types.enum';

@Injectable()
export class UploadsService {
  constructor(
    private readonly uploadToAwsProvider: UploadToAwsProvider,

    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,

    private readonly configService: ConfigService,
  ) {}

  public async uploadFile(file: Express.Multer.File) {
    // Throw error on unsuported mime types
    if (
      !['image/png', 'image/jpeg', 'image/png', 'image/jpg'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Mime type no supported');
    }

    try {
      // Upload file to AWS S3
      const name = await this.uploadToAwsProvider.fileUpload(file);

      // Generate new entry in DB
      const uploadFile: UploadFile = {
        name,
        path: `${this.configService.get('appConfig.awsCloudFrontURL')}/${name}`,
        type: fileTypes.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      const upload = this.uploadsRepository.create(uploadFile);

      return await this.uploadsRepository.save(upload);
    } catch (error) {
      console.log(error);
      throw new ConflictException(error);
    }
  }
}
