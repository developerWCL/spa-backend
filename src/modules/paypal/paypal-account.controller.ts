import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaypalAccountService } from './paypal-account.service';
import {
  CreatePaypalAccountDto,
  UpdatePaypalAccountDto,
  AssignBranchesDto,
} from './paypal.dto';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';

@Controller('paypal-accounts')
@UseGuards(StaffJwtAuthGuard)
export class PaypalAccountController {
  constructor(private readonly service: PaypalAccountService) {}

  @Post()
  create(@Body() dto: CreatePaypalAccountDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('spaId') spaId: string) {
    return this.service.findAllBySpa(spaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaypalAccountDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/branches')
  assignBranches(
    @Param('id') id: string,
    @Body() dto: AssignBranchesDto,
  ) {
    return this.service.assignBranches(id, dto.branchIds);
  }

  @Post(':id/test')
  testConnection(@Param('id') id: string) {
    return this.service.testConnection(id);
  }
}
