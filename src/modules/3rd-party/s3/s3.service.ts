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

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
  });

  async generatePresignedUrl({
    key,
    // filename,
    mimeType,
    size,
    metadata,
  }: CreateS3SignedUrlDTO) {
    // const slugified = slugify(filename);
    // console.log('Slugified filename:', slugified);

    // const extension = CONTENT_EXTENSIONS_MAP[mimeType];
    // console.log('File extension:', extension);

    if (!ACCEPTED_CONTENT_TYPES.includes(mimeType)) {
      console.log({ failure: 'Invalid file type', input: mimeType });
      throw new BadRequestException('Invalid file type');
    }

    if (size > MAX_FILE_SIZE) {
      console.log({ failure: 'File too large (MAX: 10MB)', input: size });
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

    return await getSignedUrl(this.s3, putObjectCommand, {
      expiresIn: 60,
    });
  }

  async deleteObject(key: string) {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    await this.s3.send(deleteObjectCommand);
  }
}
