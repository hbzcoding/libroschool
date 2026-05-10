import { api } from "@/lib/api";
import {
  BookRequest,
  BookRequestsPaginatedResponse,
  BookRequestsFilters,
  CreateBookRequestData,
  UpdateBookRequestData,
} from "@/types/bookRequest";

export const bookRequestsService = {
  async getRequests(filters?: BookRequestsFilters): Promise<BookRequestsPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.school_id) params.append("school_id", String(filters.school_id));
    if (filters?.grade) params.append("grade", String(filters.grade));
    if (filters?.track) params.append("track", filters.track);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.isbn) params.append("isbn", filters.isbn);
    if (filters?.max_price !== undefined) params.append("max_price", String(filters.max_price));
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const queryString = params.toString();
    const endpoint = queryString ? `/book-requests?${queryString}` : "/book-requests";

    return api.get<BookRequestsPaginatedResponse>(endpoint);
  },

  async getRequest(id: number): Promise<BookRequest> {
    const response = await api.get<{ data: BookRequest }>(`/book-requests/${id}`);
    return response.data;
  },

  async createRequest(data: CreateBookRequestData): Promise<BookRequest> {
    const response = await api.post<{ data: BookRequest }>("/book-requests", data);
    return response.data;
  },

  async updateRequest(id: number, data: UpdateBookRequestData): Promise<BookRequest> {
    const response = await api.put<{ data: BookRequest }>(`/book-requests/${id}`, data);
    return response.data;
  },

  async deleteRequest(id: number): Promise<void> {
    await api.delete(`/book-requests/${id}`);
  },

  async closeRequest(id: number): Promise<BookRequest> {
    const response = await api.post<{ data: BookRequest }>(`/book-requests/${id}/close`);
    return response.data;
  },
};
