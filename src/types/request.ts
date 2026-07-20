export type TPaginationRequest = {
  page?: number;
  rows?: number;
  searchFilters?: {
    [key: string]: string | number | boolean;
  };
  filters?: {
    [key: string]: string | number | boolean;
  };
  orderKey?: string;
  orderRule?: "asc" | "desc";
};
