import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './branches.types';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/decorator/current-user.decorator';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';

@Controller('branches')
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}
  @UseGuards(StaffJwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @UseGuards(StaffJwtAuthGuard)
  @ApiOperation({ summary: 'List branch by spaId' })
  @Get()
  findAll(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.branchesService.findAll(currentUser.branchIds);
  }

  @Get('/spa/:spaId')
  findAllBySpaId(@Param('spaId') spaId: string) {
    return this.branchesService.findBySpaId(spaId);
  }

  @Get(':spaId/location')
  findLocationBySpaId(@Param('spaId') spaId: string) {
    return this.branchesService.findLocationBySpaId(spaId);
  }

  @Get(':spaId/location/:location')
  findBranchByLocation(
    @Param('spaId') spaId: string,
    @Param('location') location: string,
  ) {
    return this.branchesService.findBranchByLocation(spaId, location);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }
  @UseGuards(StaffJwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }
  @UseGuards(StaffJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
