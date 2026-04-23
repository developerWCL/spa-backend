import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActionLog,
  FeatureType,
  ActionType,
} from '../../entities/action_log.entity';
import {
  paginate,
  getPaginationQueryTypeORM,
} from 'src/shared/pagination.util';
import { PaginationParams } from 'src/shared/pagination.types';

@ApiTags('Action Logs')
@Controller('admin/action-logs')
export class ActionLogController {
  constructor(
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Query action logs (audit trail)',
    description:
      'Retrieve audit trail of all CRUD operations with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Action logs retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - ADMIN or SUPER_ADMIN role required',
  })
  @ApiQuery({
    name: 'feature',
    required: false,
    type: 'string',
    description:
      'Filter by feature (daily, booking, promotion, service, programme, package, staff, room, bed, customer, guest)',
  })
  @ApiQuery({
    name: 'actionType',
    required: false,
    type: 'string',
    description: 'Filter by action type (create, update, delete)',
  })
  @ApiQuery({
    name: 'actorId',
    required: false,
    type: 'string',
    description: 'Filter by actor ID (staff member who performed action)',
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    type: 'string',
    description: 'Filter by entity type (e.g., booking, staff, price)',
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    type: 'string',
    description: 'Filter by entity ID',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: 'string',
    description: 'Filter by branch ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description: 'Filter by status (success, failure)',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: 'string',
    description: 'Filter by start date (ISO format)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: 'string',
    description: 'Filter by end date (ISO format)',
  })
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
    description: 'Items per page (default: 20)',
  })
  async queryActionLogs(
    @Query('feature') feature?: FeatureType,
    @Query('actionType') actionType?: ActionType,
    @Query('actorId') actorId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query() paginationParams?: PaginationParams,
  ) {
    const query = this.actionLogRepository.createQueryBuilder('log');

    // Apply filters
    if (feature) {
      query.andWhere('log.feature = :feature', { feature });
    }

    if (actionType) {
      query.andWhere('log.actionType = :actionType', { actionType });
    }

    if (actorId) {
      query.andWhere('log.actorId = :actorId', { actorId });
    }

    if (entityType) {
      query.andWhere('log.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('log.entityId = :entityId', { entityId });
    }

    if (branchId) {
      query.andWhere('log.branchId = :branchId', { branchId });
    }

    if (status) {
      query.andWhere('log.status = :status', { status });
    }

    // Date range filter
    if (from) {
      const fromDate = new Date(from);
      query.andWhere('log.actionDate >= :from', { from: fromDate });
    }

    if (to) {
      const toDate = new Date(to);
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      query.andWhere('log.actionDate <= :to', { to: toDate });
    }

    // Order by action date descending
    query.orderBy('log.actionDate', 'DESC');

    // Pagination
    const paginationQuery = getPaginationQueryTypeORM(paginationParams);
    const [data, total] = await query
      .skip(paginationQuery.skip)
      .take(paginationQuery.take)
      .getManyAndCount();

    return paginate(paginationParams || {}, total, data);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get action log statistics',
    description: 'Get aggregate statistics of action logs',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiQuery({
    name: 'feature',
    required: false,
    type: 'string',
    description: 'Filter by feature',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: 'string',
    description: 'Filter by branch ID',
  })
  async getActionLogStats(
    @Query('feature') feature?: FeatureType,
    @Query('branchId') branchId?: string,
  ) {
    const query = this.actionLogRepository.createQueryBuilder('log');

    if (feature) {
      query.andWhere('log.feature = :feature', { feature });
    }

    if (branchId) {
      query.andWhere('log.branchId = :branchId', { branchId });
    }

    const totalCount = await query.getCount();

    const stats = await query
      .select('log.actionType', 'actionType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.actionType')
      .getRawMany();

    const featureStats = await this.actionLogRepository
      .createQueryBuilder('log')
      .select('log.feature', 'feature')
      .addSelect('COUNT(*)', 'count')
      .where(
        feature ? 'log.feature = :feature' : '1=1',
        feature ? { feature } : {},
      )
      .andWhere(
        branchId ? 'log.branchId = :branchId' : '1=1',
        branchId ? { branchId } : {},
      )
      .groupBy('log.feature')
      .getRawMany();

    return {
      total: totalCount,
      byActionType: stats,
      byFeature: featureStats,
    };
  }

  @Get('actors')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list of actors (staff members with actions)',
    description: 'Get unique list of staff members who have performed actions',
  })
  @ApiResponse({
    status: 200,
    description: 'Actors list retrieved successfully',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: 'string',
    description: 'Filter by branch ID',
  })
  async getActors(@Query('branchId') branchId?: string) {
    const query = this.actionLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.actorId', 'actorId')
      .addSelect('log.actorName', 'actorName')
      .where('log.actorId IS NOT NULL');

    if (branchId) {
      query.andWhere('log.branchId = :branchId', { branchId });
    }

    const actors = await query.orderBy('log.actionDate', 'DESC').getRawMany();

    return actors;
  }

  @Get('features')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list of features with action logs',
    description: 'Get unique list of features that have action logs',
  })
  @ApiResponse({
    status: 200,
    description: 'Features list retrieved successfully',
  })
  async getFeatures() {
    const features = await this.actionLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.feature', 'feature')
      .orderBy('log.feature', 'ASC')
      .getRawMany();

    return features.map((f) => f.feature);
  }
}
