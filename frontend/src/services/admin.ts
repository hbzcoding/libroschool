import { api } from "@/lib/api";
import {
  AdminUser,
  AdminUsersPaginatedResponse,
  AdminUsersFilters,
  BanUserData,
  AdminBook,
  AdminBooksPaginatedResponse,
  AdminBooksFilters,
  AdminBookRequest,
  AdminBookRequestsPaginatedResponse,
  AdminBookRequestsFilters,
  AdminNote,
  AdminNotesPaginatedResponse,
  AdminNotesFilters,
  AdminClassroom,
  AdminClassroomsPaginatedResponse,
  AdminClassroomsFilters,
  AdminReport,
  AdminReportsPaginatedResponse,
  AdminReportsFilters,
  AdminSchoolsPaginatedResponse,
  AdminSchoolsFilters,
  CreateSchoolData,
  UpdateSchoolData,
  AdminDashboardStats,
} from "@/types/admin";

// Helper to build query params
function buildQueryParams<T extends object>(filters?: T): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString() ? `?${params.toString()}` : "";
}

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get<{ data: AdminDashboardStats }>("/admin/stats");
    return response.data;
  },

  // Users
  async getUsers(filters?: AdminUsersFilters): Promise<AdminUsersPaginatedResponse> {
    const endpoint = `/admin/users${buildQueryParams(filters)}`;
    return api.get<AdminUsersPaginatedResponse>(endpoint);
  },

  async getUser(id: number): Promise<AdminUser> {
    const response = await api.get<{ data: AdminUser }>(`/admin/users/${id}`);
    return response.data;
  },

  async updateUser(id: number, data: Partial<AdminUser>): Promise<AdminUser> {
    const response = await api.put<{ data: AdminUser }>(`/admin/users/${id}`, data);
    return response.data;
  },

  async banUser(id: number, data?: BanUserData): Promise<AdminUser> {
    const response = await api.post<{ data: AdminUser }>(`/admin/users/${id}/ban`, data);
    return response.data;
  },

  async unbanUser(id: number): Promise<AdminUser> {
    const response = await api.post<{ data: AdminUser }>(`/admin/users/${id}/unban`);
    return response.data;
  },

  // Books
  async getBooks(filters?: AdminBooksFilters): Promise<AdminBooksPaginatedResponse> {
    const endpoint = `/admin/books${buildQueryParams(filters)}`;
    return api.get<AdminBooksPaginatedResponse>(endpoint);
  },

  async getBook(id: number): Promise<AdminBook> {
    const response = await api.get<{ data: AdminBook }>(`/admin/books/${id}`);
    return response.data;
  },

  async hideBook(id: number): Promise<AdminBook> {
    const response = await api.post<{ data: AdminBook }>(`/admin/books/${id}/hide`);
    return response.data;
  },

  async unhideBook(id: number): Promise<AdminBook> {
    const response = await api.post<{ data: AdminBook }>(`/admin/books/${id}/unhide`);
    return response.data;
  },

  async deleteBook(id: number): Promise<void> {
    await api.delete(`/admin/books/${id}`);
  },

  // Book Requests
  async getBookRequests(filters?: AdminBookRequestsFilters): Promise<AdminBookRequestsPaginatedResponse> {
    const endpoint = `/admin/book-requests${buildQueryParams(filters)}`;
    return api.get<AdminBookRequestsPaginatedResponse>(endpoint);
  },

  async getBookRequest(id: number): Promise<AdminBookRequest> {
    const response = await api.get<{ data: AdminBookRequest }>(`/admin/book-requests/${id}`);
    return response.data;
  },

  async hideBookRequest(id: number): Promise<AdminBookRequest> {
    const response = await api.post<{ data: AdminBookRequest }>(`/admin/book-requests/${id}/hide`);
    return response.data;
  },

  async unhideBookRequest(id: number): Promise<AdminBookRequest> {
    const response = await api.post<{ data: AdminBookRequest }>(`/admin/book-requests/${id}/unhide`);
    return response.data;
  },

  async deleteBookRequest(id: number): Promise<void> {
    await api.delete(`/admin/book-requests/${id}`);
  },

  // Notes
  async getNotes(filters?: AdminNotesFilters): Promise<AdminNotesPaginatedResponse> {
    const endpoint = `/admin/notes${buildQueryParams(filters)}`;
    return api.get<AdminNotesPaginatedResponse>(endpoint);
  },

  async getNote(id: number): Promise<AdminNote> {
    const response = await api.get<{ data: AdminNote }>(`/admin/notes/${id}`);
    return response.data;
  },

  async hideNote(id: number): Promise<AdminNote> {
    const response = await api.post<{ data: AdminNote }>(`/admin/notes/${id}/hide`);
    return response.data;
  },

  async unhideNote(id: number): Promise<AdminNote> {
    const response = await api.post<{ data: AdminNote }>(`/admin/notes/${id}/unhide`);
    return response.data;
  },

  async deleteNote(id: number): Promise<void> {
    await api.delete(`/admin/notes/${id}`);
  },

  // Classrooms
  async getClassrooms(filters?: AdminClassroomsFilters): Promise<AdminClassroomsPaginatedResponse> {
    const endpoint = `/admin/classrooms${buildQueryParams(filters)}`;
    return api.get<AdminClassroomsPaginatedResponse>(endpoint);
  },

  async getClassroom(id: number): Promise<AdminClassroom> {
    const response = await api.get<{ data: AdminClassroom }>(`/admin/classrooms/${id}`);
    return response.data;
  },

  async lockClassroom(id: number): Promise<AdminClassroom> {
    const response = await api.post<{ data: AdminClassroom }>(`/admin/classrooms/${id}/lock`);
    return response.data;
  },

  async unlockClassroom(id: number): Promise<AdminClassroom> {
    const response = await api.post<{ data: AdminClassroom }>(`/admin/classrooms/${id}/unlock`);
    return response.data;
  },

  async deleteClassroom(id: number): Promise<void> {
    await api.delete(`/admin/classrooms/${id}`);
  },

  // Reports
  async getReports(filters?: AdminReportsFilters): Promise<AdminReportsPaginatedResponse> {
    const endpoint = `/admin/reports${buildQueryParams(filters)}`;
    return api.get<AdminReportsPaginatedResponse>(endpoint);
  },

  async getReport(id: number): Promise<AdminReport> {
    const response = await api.get<{ data: AdminReport }>(`/admin/reports/${id}`);
    return response.data;
  },

  async resolveReport(id: number): Promise<AdminReport> {
    const response = await api.post<{ data: AdminReport }>(`/admin/reports/${id}/resolve`);
    return response.data;
  },

  async dismissReport(id: number): Promise<AdminReport> {
    const response = await api.post<{ data: AdminReport }>(`/admin/reports/${id}/dismiss`);
    return response.data;
  },

  // Schools
  async getSchools(filters?: AdminSchoolsFilters): Promise<AdminSchoolsPaginatedResponse> {
    const endpoint = `/admin/schools${buildQueryParams(filters)}`;
    return api.get<AdminSchoolsPaginatedResponse>(endpoint);
  },

  async createSchool(data: CreateSchoolData): Promise<import("@/types/school").School> {
    const response = await api.post<{ data: import("@/types/school").School }>("/admin/schools", data);
    return response.data;
  },

  async updateSchool(id: number, data: UpdateSchoolData): Promise<import("@/types/school").School> {
    const response = await api.put<{ data: import("@/types/school").School }>(`/admin/schools/${id}`, data);
    return response.data;
  },

  async deleteSchool(id: number): Promise<void> {
    await api.delete(`/admin/schools/${id}`);
  },
};