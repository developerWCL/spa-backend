import {
  paginate,
  calculateOffset,
  getPaginationQuery,
  getPaginationQueryTypeORM,
} from './pagination.util';

describe('Pagination Utility', () => {
  describe('calculateOffset', () => {
    it('should calculate offset correctly for first page', () => {
      const offset = calculateOffset(1, 10);
      expect(offset).toBe(0);
    });

    it('should calculate offset correctly for middle pages', () => {
      const offset = calculateOffset(3, 20);
      expect(offset).toBe(40);
    });

    it('should calculate offset correctly for last page', () => {
      const offset = calculateOffset(5, 15);
      expect(offset).toBe(60);
    });
  });

  describe('paginate function', () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    it('should return paginated response with correct structure', () => {
      const response = paginate({ page: 1, limit: 10 }, 100, mockData);

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('meta');
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.meta).toHaveProperty('totalItems');
      expect(response.meta).toHaveProperty('itemCount');
      expect(response.meta).toHaveProperty('itemsPerPage');
      expect(response.meta).toHaveProperty('totalPages');
      expect(response.meta).toHaveProperty('currentPage');
    });

    it('should use default page (1) when not provided', () => {
      const response = paginate({}, 100, mockData);
      expect(response.meta.currentPage).toBe(1);
    });

    it('should use default limit (10) when not provided', () => {
      const response = paginate({}, 100, mockData);
      expect(response.meta.itemsPerPage).toBe(10);
    });

    it('should parse string page number correctly', () => {
      const response = paginate({ page: '3', limit: '20' }, 100, mockData);
      expect(response.meta.currentPage).toBe(3);
      expect(response.meta.itemsPerPage).toBe(20);
    });

    it('should default to page 1 for negative page number', () => {
      const response = paginate({ page: -5, limit: 10 }, 100, mockData);
      expect(response.meta.currentPage).toBe(1);
    });

    it('should default to page 1 for invalid page string', () => {
      const response = paginate({ page: 'invalid', limit: 10 }, 100, mockData);
      expect(response.meta.currentPage).toBe(1);
    });

    it('should cap limit at maximum (100)', () => {
      const response = paginate({ page: 1, limit: 500 }, 100, mockData);
      expect(response.meta.itemsPerPage).toBe(100);
    });

    it('should calculate correct totalPages', () => {
      const response1 = paginate({ page: 1, limit: 10 }, 100, mockData);
      expect(response1.meta.totalPages).toBe(10);

      const response2 = paginate({ page: 1, limit: 10 }, 95, mockData);
      expect(response2.meta.totalPages).toBe(10);

      const response3 = paginate({ page: 1, limit: 25 }, 100, mockData);
      expect(response3.meta.totalPages).toBe(4);
    });

    it('should return correct itemCount (length of data array)', () => {
      const response = paginate({ page: 1, limit: 10 }, 100, mockData);
      expect(response.meta.itemCount).toBe(2);
    });

    it('should handle totalItems as 0', () => {
      const response = paginate({ page: 1, limit: 10 }, 0, []);
      expect(response.meta.totalItems).toBe(0);
      expect(response.meta.totalPages).toBe(0);
      expect(response.meta.itemCount).toBe(0);
    });

    it('should handle negative totalItems as 0', () => {
      const response = paginate({ page: 1, limit: 10 }, -50, mockData);
      expect(response.meta.totalItems).toBe(0);
    });

    it('should return correct data array', () => {
      const response = paginate({ page: 1, limit: 10 }, 100, mockData);
      expect(response.data).toEqual(mockData);
    });

    it('should handle empty data array', () => {
      const response = paginate({ page: 5, limit: 10 }, 100, []);
      expect(response.data).toEqual([]);
      expect(response.meta.itemCount).toBe(0);
    });

    it('should handle float page numbers by flooring', () => {
      const response = paginate({ page: 2.7, limit: 10 }, 100, mockData);
      expect(response.meta.currentPage).toBe(2);
    });

    it('should handle float limit numbers by flooring', () => {
      const response = paginate({ page: 1, limit: 10.9 }, 100, mockData);
      expect(response.meta.itemsPerPage).toBe(10);
    });

    it('should handle zero page as invalid and default to 1', () => {
      const response = paginate({ page: 0, limit: 10 }, 100, mockData);
      expect(response.meta.currentPage).toBe(1);
    });

    it('should handle zero limit as invalid and default to 10', () => {
      const response = paginate({ page: 1, limit: 0 }, 100, mockData);
      expect(response.meta.itemsPerPage).toBe(10);
    });

    it('should handle null/undefined parameters', () => {
      const response = paginate(
        { page: null as any, limit: undefined },
        100,
        mockData,
      );
      expect(response.meta.currentPage).toBe(1);
      expect(response.meta.itemsPerPage).toBe(10);
    });
  });

  describe('getPaginationQuery', () => {
    it('should return skip and take values for database query', () => {
      const query = getPaginationQuery({ page: 2, limit: 20 });
      expect(query.skip).toBe(20);
      expect(query.take).toBe(20);
    });

    it('should handle defaults', () => {
      const query = getPaginationQuery({});
      expect(query.skip).toBe(0);
      expect(query.take).toBe(10);
    });

    it('should handle string parameters', () => {
      const query = getPaginationQuery({ page: '3', limit: '50' });
      expect(query.skip).toBe(100);
      expect(query.take).toBe(50);
    });

    it('should cap limit at maximum', () => {
      const query = getPaginationQuery({ page: 1, limit: 200 });
      expect(query.take).toBe(100);
    });
  });

  describe('getPaginationQueryTypeORM', () => {
    it('should return skip and take values for TypeORM', () => {
      const query = getPaginationQueryTypeORM({ page: 2, limit: 20 });
      expect(query.skip).toBe(20);
      expect(query.take).toBe(20);
    });

    it('should be compatible with getPaginationQuery', () => {
      const params = { page: 3, limit: 25 };
      const query1 = getPaginationQuery(params);
      const query2 = getPaginationQueryTypeORM(params);

      expect(query1).toEqual(query2);
    });
  });

  describe('Integration tests', () => {
    it('should work end-to-end with realistic data', () => {
      const totalItems = 150;
      const page = 2;
      const limit = 20;

      // Simulate database query
      const mockResults = Array.from({ length: limit }, (_, i) => ({
        id: (page - 1) * limit + i + 1,
        name: `Item ${(page - 1) * limit + i + 1}`,
      }));

      const response = paginate({ page, limit }, totalItems, mockResults);

      expect(response.meta.totalItems).toBe(150);
      expect(response.meta.totalPages).toBe(8);
      expect(response.meta.currentPage).toBe(2);
      expect(response.meta.itemsPerPage).toBe(20);
      expect(response.meta.itemCount).toBe(20);
      expect(response.data.length).toBe(20);
      expect(response.data[0].id).toBe(21);
    });

    it('should work with last page having fewer items', () => {
      const totalItems = 155; // 7 full pages + 1 partial page
      const page = 8;
      const limit = 20;

      const mockResults = Array.from({ length: 15 }, (_, i) => ({
        id: 141 + i,
        name: `Item ${141 + i}`,
      }));

      const response = paginate({ page, limit }, totalItems, mockResults);

      expect(response.meta.totalItems).toBe(155);
      expect(response.meta.totalPages).toBe(8);
      expect(response.meta.currentPage).toBe(8);
      expect(response.meta.itemCount).toBe(15);
    });
  });
});
