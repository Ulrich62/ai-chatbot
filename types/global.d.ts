export {};
declare global {
  interface PaginateList<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
  interface BasePaginationParams {
    page?: number;
    limit?: number;
    search?: string;
  }
}
