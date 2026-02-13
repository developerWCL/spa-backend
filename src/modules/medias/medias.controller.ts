import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { MediasService } from './medias.service';
import {
  ApiTags,
  ApiHeader,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@ApiTags('📁 Media Management')
@Controller('medias')
export class MediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Post('upload-urls')
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa/branch ID',
    required: false,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filename: { type: 'string', example: 'service-image.jpg' },
              mimeType: { type: 'string', example: 'image/jpeg' },
              size: { type: 'number', example: 1024 },
            },
            required: ['filename', 'mimeType', 'size'],
          },
          maxItems: 5,
        },
      },
      required: ['images'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URLs generated successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          mediaId: { type: 'string' },
        },
      },
    },
  })
  async generateUploadUrls(
    @Body()
    body: {
      images: Array<{ filename: string; mimeType: string; size: number }>;
    },
  ) {
    if (!body.images || !Array.isArray(body.images)) {
      throw new BadRequestException('Images array is required');
    }

    if (body.images.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed');
    }

    if (body.images.length === 0) {
      throw new BadRequestException('At least 1 image is required');
    }

    return this.mediasService.generateUploadUrls(body.images);
  }
}
