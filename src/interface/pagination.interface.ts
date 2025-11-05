export interface IPagination {
  total: number;
  page: number;
  limit: number;
}

export interface IPaginationMetadata {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}
