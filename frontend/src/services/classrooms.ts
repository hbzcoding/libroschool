import { api } from "@/lib/api";
import {
  Classroom,
  ClassroomMember,
  ClassroomsPaginatedResponse,
  ClassroomsFilters,
  CreateClassroomData,
  UpdateClassroomData,
  JoinByCodeData,
  UpdateMemberRoleData,
} from "@/types/classroom";

export const classroomsService = {
  async getClassrooms(filters?: ClassroomsFilters): Promise<ClassroomsPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.school_id) params.append("school_id", String(filters.school_id));
    if (filters?.grade) params.append("grade", String(filters.grade));
    if (filters?.academic_year) params.append("academic_year", filters.academic_year);
    if (filters?.is_private !== undefined) params.append("is_private", String(filters.is_private));
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const queryString = params.toString();
    const endpoint = queryString ? `/classrooms?${queryString}` : "/classrooms";

    return api.get<ClassroomsPaginatedResponse>(endpoint);
  },

  async getClassroom(id: number): Promise<Classroom> {
    const response = await api.get<{ data: Classroom }>(`/classrooms/${id}`);
    return response.data;
  },

  async createClassroom(data: CreateClassroomData): Promise<Classroom> {
    const response = await api.post<{ data: Classroom }>("/classrooms", data);
    return response.data;
  },

  async updateClassroom(id: number, data: UpdateClassroomData): Promise<Classroom> {
    const response = await api.put<{ data: Classroom }>(`/classrooms/${id}`, data);
    return response.data;
  },

  async deleteClassroom(id: number): Promise<void> {
    await api.delete(`/classrooms/${id}`);
  },

  async joinClassroom(id: number): Promise<Classroom> {
    const response = await api.post<{ data: Classroom }>(`/classrooms/${id}/join`);
    return response.data;
  },

  async joinByCode(code: string): Promise<Classroom> {
    const data: JoinByCodeData = { join_code: code };
    const response = await api.post<{ data: Classroom }>("/classrooms/join-by-code", data);
    return response.data;
  },

  async leaveClassroom(id: number): Promise<void> {
    await api.post(`/classrooms/${id}/leave`);
  },

  async getMembers(id: number, filters?: { page?: number; per_page?: number }): Promise<{ data: ClassroomMember[]; meta: { current_page: number; per_page: number; total: number; last_page: number } }> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const queryString = params.toString();
    const endpoint = queryString
      ? `/classrooms/${id}/members?${queryString}`
      : `/classrooms/${id}/members`;

    return api.get(endpoint);
  },

  async updateMemberRole(classroomId: number, userId: number, role: UpdateMemberRoleData): Promise<void> {
    await api.post(`/classrooms/${classroomId}/members/${userId}/role`, role);
  },

  async removeMember(classroomId: number, userId: number): Promise<void> {
    await api.delete(`/classrooms/${classroomId}/members/${userId}`);
  },

  async regenerateJoinCode(id: number): Promise<Classroom> {
    const response = await api.post<{ data: Classroom }>(`/classrooms/${id}/regenerate-join-code`);
    return response.data;
  },
};
