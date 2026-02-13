/**
 * Pagination Request Parameters
 */
export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
