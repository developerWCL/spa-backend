import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from '../3rd-party/s3/s3.service';

import { v4 as uuid } from 'uuid';
import { Media } from 'src/entities/media.entity';
import { Service } from 'src/entities/services.entity';

@Injectable()
export class MediasService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async generateUploadUrls(
    images: Array<{ filename: string; mimeType: string; size: number }>,
  ) {
    const uploadUrls: Array<{ url: string; mediaId: string }> = [];

    for (const image of images) {
      const mediaId = uuid();
      const key = `services/${mediaId}/${image.filename}`;

      const presignedUrl = await this.s3Service.generatePresignedUrl({
        key,
        filename: image.filename,
        mimeType: image.mimeType as any,
        size: image.size,
        metadata: {
          mediaId,
        },
      });

      // Create media record in database (without associating to service yet)
      const media = new Media();
      media.id = mediaId;
      media.filename = image.filename;
      media.mimeType = image.mimeType;
      media.type = 'image'; // Set type to 'image' for image uploads
      // Store the full S3 URL
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const region = process.env.AWS_S3_BUCKET_REGION;
      media.url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      // Don't associate with service yet; that will happen during service creation/update
      await this.mediaRepository.save(media);

      uploadUrls.push({
        url: presignedUrl,
        mediaId,
      });
    }

    return uploadUrls;
  }
}
