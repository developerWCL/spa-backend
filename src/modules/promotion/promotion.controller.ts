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
@UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.create(dto);
  }

  @Get()
  findAll(
    @Query('branchId') branchId: string,
    @CurrentUser() currentUser?: CurrentUserPayload,

    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.promotionService.findAll(
      branchId,
      currentUser,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }
}
