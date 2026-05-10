import { api } from "@/lib/api";
import { School, SchoolsPaginatedResponse, SchoolsFilters } from "@/types/school";

export const schoolsService = {
  async getSchools(filters?: SchoolsFilters): Promise<SchoolsPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.city) {
      params.append("city", filters.city);
    }
    if (filters?.province) {
      params.append("province", filters.province);
    }
    if (filters?.region) {
      params.append("region", filters.region);
    }
    if (filters?.school_type) {
      params.append("school_type", filters.school_type);
    }
    if (filters?.page) {
      params.append("page", String(filters.page));
    }
    if (filters?.per_page) {
      params.append("per_page", String(filters.per_page));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/schools?${queryString}` : "/schools";

    return api.get<SchoolsPaginatedResponse>(endpoint);
  },

  async getSchool(id: number): Promise<School> {
    const response = await api.get<{ data: School }>(`/schools/${id}`);
    return response.data;
  },
};