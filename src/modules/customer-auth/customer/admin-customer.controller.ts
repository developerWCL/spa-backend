import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { StaffJwtAuthGuard } from '../../../guards/staff-jwt.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { Permissions } from '../../../decorator/permissions.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../decorator/current-user.decorator';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { PaginationParams } from '../../../shared/pagination.types';

@ApiTags('Customer Management')
@ApiBearerAuth()
@Controller('admin/customers')
// @UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class AdminCustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'List all customers with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by name or email',
  })
  @Get()
  // @Permissions('manage:customers')
  //@UseGuards(ApiKeyGuard)
  list(
    @Headers('spa-id') spaId: string,
    @Query() paginationParams: PaginationParams,
    @Query('search') search?: string,
  ): Promise<any> {
    return this.customerService.list(paginationParams, spaId, {
      search,
    });
  }

  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @Get(':id')
  @Permissions('manage:customers')
  //@UseGuards(ApiKeyGuard)
  get(@Param('id') id: string): Promise<any> {
    return this.customerService.getById(id);
  }

  @ApiOperation({ summary: 'Create a new customer' })
  @Post()
  @Permissions('manage:customers')
  //@UseGuards(ApiKeyGuard)
  create(
    @Body() body: CreateCustomerDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ): Promise<any> {
    return this.customerService.createWithSpa(
      body,
      currentUser?.spaIds,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @Put(':id')
  @Permissions('manage:customers')
  //@UseGuards(ApiKeyGuard)
  update(
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ): Promise<any> {
    return this.customerService.update(
      id,
      body,
      undefined,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @ApiOperation({ summary: 'Delete a customer (soft delete)' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @Delete(':id')
  @Permissions('manage:customers')
  //@UseGuards(ApiKeyGuard)
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ): Promise<any> {
    return this.customerService.delete(
      id,
      currentUser?.sub,
      currentUser?.email,
    );
  }
}
