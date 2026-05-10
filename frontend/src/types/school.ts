export interface School {
  id: number;
  code: string;
  name: string;
  city: string;
  province: string;
  region: string;
  country: string;
  school_type: string;
}

export interface SchoolsPaginatedResponse {
  data: School[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface SchoolsFilters {
  search?: string;
  city?: string;
  province?: string;
  region?: string;
  school_type?: string;
  page?: number;
  per_page?: number;
}