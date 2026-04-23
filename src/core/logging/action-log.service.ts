import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActionLog,
  ActionType,
  FeatureType,
  SubFeatureType,
} from '../../entities/action_log.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

export interface LogActionInput {
  /** Action type: create, update, delete */
  actionType: ActionType;
  /** Feature: daily, booking, promotion, etc. */
  feature: FeatureType;
  /** Sub-feature: price, staff_dayoff, room_closure, etc. */
  subFeature?: SubFeatureType | null;
  /** Actor ID (User ID performing the action) */
  actorId: string;
  /** Actor name (for display purposes) */
  actorName?: string | null;
  /** Branch ID where the action occurred */
  branchId?: string | null;
  /** New data/values after action */
  newData?: Record<string, any> | null;
  /** Previous data/values before action (for updates) */
  oldData?: Record<string, any> | null;
  /** Type of entity affected (e.g., 'booking', 'staff', 'price') */
  entityType?: string | null;
  /** ID of entity affected */
  entityId?: string | null;
  /** Additional description or context */
  description?: string | null;
  /** Status of action: success or failure */
  status?: 'success' | 'failure';
}

/**
 * Service for logging user actions to the database.
 * Captures audit trail of all CRUD operations in the system.
 *
 * @example
 * await this.actionLogService.logAction({
 *   actionType: 'create',
 *   feature: 'booking',
 *   subFeature: 'price',
 *   actorId: userId,
 *   actorName: userName,
 *   newData: { priceValue: 500, currency: 'THB' },
 *   entityType: 'booking',
 *   entityId: bookingId,
 * });
 */
@Injectable()
export class ActionLogService {
  constructor(
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
    @Inject(REQUEST)
    private request?: Request,
  ) {}

  /**
   * Log an action to the database.
   * Automatically captures IP address from request if available.
   */
  async logAction(input: LogActionInput): Promise<ActionLog> {
    const ipAddress = this.getClientIpAddress();

    const actionLog = this.actionLogRepository.create({
      actionDate: new Date(),
      actionType: input.actionType,
      feature: input.feature,
      subFeature: input.subFeature || null,
      actorId: input.actorId,
      actorName: input.actorName || null,
      branchId: input.branchId || null,
      newData: input.newData || null,
      oldData: input.oldData || null,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      description: input.description || null,
      status: input.status || 'success',
      ipAddress: ipAddress,
    });

    return await this.actionLogRepository.save(actionLog);
  }

  /**
   * Get action logs with filters
   */
  async getActionLogs(filters?: {
    feature?: FeatureType;
    actionType?: ActionType;
    actorId?: string;
    entityId?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = this.actionLogRepository.createQueryBuilder('actionLog');

    if (filters?.feature) {
      query.andWhere('actionLog.feature = :feature', {
        feature: filters.feature,
      });
    }

    if (filters?.actionType) {
      query.andWhere('actionLog.actionType = :actionType', {
        actionType: filters.actionType,
      });
    }

    if (filters?.actorId) {
      query.andWhere('actionLog.actorId = :actorId', {
        actorId: filters.actorId,
      });
    }

    if (filters?.entityId) {
      query.andWhere('actionLog.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters?.entityType) {
      query.andWhere('actionLog.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    query.orderBy('actionLog.actionDate', 'DESC');

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    return await query.getManyAndCount();
  }

  /**
   * Get action logs for a specific entity
   */
  async getEntityActionHistory(entityId: string, entityType: string) {
    return await this.actionLogRepository.find({
      where: {
        entityId,
        entityType,
      },
      order: {
        actionDate: 'DESC',
      },
    });
  }

  /**
   * Get user's action history
   */
  async getUserActionHistory(actorId: string, limit: number = 50) {
    return await this.actionLogRepository.find({
      where: {
        actorId,
      },
      order: {
        actionDate: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Extract client IP address from request
   */
  private getClientIpAddress(): string | null {
    if (!this.request) {
      return null;
    }

    return (
      (this.request.headers['x-forwarded-for'] as string)
        ?.split(',')[0]
        .trim() ||
      (this.request.headers['x-real-ip'] as string) ||
      this.request.socket.remoteAddress ||
      null
    );
  }
}
