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
@UseGuards(StaffJwtAuthGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @ApiOperation({ summary: 'List branch by spaId' })
  @Get()
  findAll(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.branchesService.findAll(currentUser.branchIds);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
