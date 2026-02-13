import {
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
} from './pagination.types';

/**
 * Validates and normalizes pagination parameters
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Normalized pagination parameters
 */
function validatePaginationParams(
  page?: number | string,
  limit?: number | string,
): { page: number; limit: number } {
  // Parse page
  let parsedPage = 1;
  if (page !== undefined && page !== null) {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    if (!isNaN(pageNum) && pageNum > 0) {
      parsedPage = Math.floor(pageNum);
    }
  }

  // Parse limit
  let parsedLimit = 10;
  if (limit !== undefined && limit !== null) {
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    if (!isNaN(limitNum) && limitNum > 0) {
      parsedLimit = Math.floor(limitNum);
    }
  }

  // Cap the limit to a reasonable maximum (e.g., 100 items per page)
  const MAX_LIMIT = 100;
  parsedLimit = Math.min(parsedLimit, MAX_LIMIT);

  return { page: parsedPage, limit: parsedLimit };
}

/**
 * Creates pagination metadata
 * @param totalItems - Total number of items in database
 * @param itemCount - Number of items in current page
 * @param limit - Items per page
 * @param page - Current page number
 * @returns Pagination metadata object
 */
function createPaginationMeta(
  totalItems: number,
  itemCount: number,
  limit: number,
  page: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    itemCount,
    itemsPerPage: limit,
    totalPages,
    currentPage: page,
  };
}

/**
 * Calculates the offset (skip) for database queries
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Offset value for skip in queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Main pagination utility function
 * Handles pagination logic for database queries
 *
 * @param params - Pagination parameters (page, limit)
 * @param totalItems - Total count of items in database
 * @param data - Array of paginated results
 * @returns Paginated response with data and metadata
 *
 * @example
 * // With TypeORM query builder
 * const [results, totalCount] = await queryBuilder
 *   .skip(offset)
 *   .take(limit)
 *   .getManyAndCount();
 *
 * const response = paginate(
 *   { page: req.query.page, limit: req.query.limit },
 *   totalCount,
 *   results
 * );
 *
 * @example
 * // With Prisma
 * const [results, totalCount] = await Promise.all([
 *   prisma.staff.findMany({
 *     skip: calculateOffset(page, limit),
 *     take: limit,
 *   }),
 *   prisma.staff.count(),
 * ]);
 *
 * const response = paginate(
 *   { page, limit },
 *   totalCount,
 *   results
 * );
 */
export function paginate<T>(
  params: PaginationParams,
  totalItems: number,
  data: T[],
): PaginatedResponse<T> {
  // Validate and normalize parameters
  const { page, limit } = validatePaginationParams(params.page, params.limit);

  // Ensure totalItems is a valid number
  const validTotalItems = Math.max(
    0,
    typeof totalItems === 'number' ? totalItems : 0,
  );

  // Create metadata
  const meta = createPaginationMeta(validTotalItems, data.length, limit, page);

  return {
    data,
    meta,
  };
}

/**
 * Utility function to create pagination query params for database queries
 * Returns both offset and limit for use in database operations
 *
 * @param params - Pagination parameters
 * @returns Object with skip (offset) and take (limit) values
 *
 * @example
 * const { skip, take } = getPaginationQuery({ page: 2, limit: 20 });
 * const results = await prisma.staff.findMany({ skip, take });
 */
export function getPaginationQuery(params: PaginationParams): {
  skip: number;
  take: number;
} {
  const { page, limit } = validatePaginationParams(params.page, params.limit);
  const skip = calculateOffset(page, limit);

  return {
    skip,
    take: limit,
  };
}

/**
 * Utility function to create pagination query params for TypeORM query builders
 * Returns both skip and take values for use with TypeORM
 *
 * @param params - Pagination parameters
 * @returns Object with skip and take values for TypeORM
 *
 * @example
 * const { skip, take } = getPaginationQueryTypeORM({ page: 2, limit: 20 });
 * const results = await queryBuilder.skip(skip).take(take).getManyAndCount();
 */
export function getPaginationQueryTypeORM(params: PaginationParams): {
  skip: number;
  take: number;
} {
  // Same implementation as getPaginationQuery for TypeORM compatibility
  return getPaginationQuery(params);
}
