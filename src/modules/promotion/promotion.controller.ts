import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
  Headers,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto } from './promotion.dto';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/decorator/current-user.decorator';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @UseGuards(StaffJwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreatePromotionDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.promotionService.create(
      dto,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @Get()
  findAll(
    @Headers('spa-id') spaId?: string,
    @Query('branchId')
    branchId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('serviceIds') serviceIds?: string,
    @Query('available-only') availableOnly?: string,
  ) {
    return this.promotionService.findAll(
      spaId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      status,
      branchId,
      serviceIds,
      availableOnly,
    );
  }

  @Get('auto-apply/:spaId')
  findAutoApply(
    @Param('spaId') spaId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.promotionService.findAutoApply(spaId, branchId);
  }

  @Get('used/:userId')
  findUsedPromotions(
    @Param('userId') userId: string,
    @Query('branchId') branchId: string,
    @Query('promotionId') promotionId?: string,
  ) {
    return this.promotionService.findUsedPromotions(
      userId,
      branchId,
      promotionId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.promotionService.update(
      id,
      dto,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @UseGuards(StaffJwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.promotionService.remove(
      id,
      currentUser?.sub,
      currentUser?.email,
    );
  }
}
