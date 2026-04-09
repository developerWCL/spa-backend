// s3.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  ACCEPTED_CONTENT_TYPES,
  CreateS3SignedUrlDTO,
  MAX_FILE_SIZE,
} from './s3.types';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
  });

  constructor(private logger: AppLoggerService) {
    this.logger.setContext('S3Service');
  }

  async generatePresignedUrl({
    key,
    // filename,
    mimeType,
    size,
    metadata,
  }: CreateS3SignedUrlDTO) {
    this.logger.log('Generating presigned URL', { key, mimeType, size });
    // const slugified = slugify(filename);
    // console.log('Slugified filename:', slugified);

    // const extension = CONTENT_EXTENSIONS_MAP[mimeType];
    // console.log('File extension:', extension);

    if (!ACCEPTED_CONTENT_TYPES.includes(mimeType)) {
      this.logger.error('Invalid file type', null, { mimeType });
      throw new BadRequestException('Invalid file type');
    }

    if (size > MAX_FILE_SIZE) {
      this.logger.error('File too large', null, {
        size,
        maxSize: MAX_FILE_SIZE,
      });
      throw new BadRequestException('File too large (MAX: 10MB)');
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
      // ContentLength: size,
      // ChecksumSHA256: checksum,
      Metadata: metadata,
    });

    const url = await getSignedUrl(this.s3, putObjectCommand, {
      expiresIn: 60,
    });
    this.logger.log('Presigned URL generated successfully', { key });
    return url;
  }

  async deleteObject(key: string) {
    this.logger.log('Deleting S3 object', { key });
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    await this.s3.send(deleteObjectCommand);
    this.logger.log('S3 object deleted successfully', { key });
  }
}
