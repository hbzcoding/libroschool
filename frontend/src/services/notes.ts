import { api } from "@/lib/api";
import {
  Note,
  NotesPaginatedResponse,
  NotesFilters,
  CreateNoteData,
  UpdateNoteData,
  AddPermissionData,
  NotePermission,
} from "@/types/note";

export const notesService = {
  async getNotes(filters?: NotesFilters): Promise<NotesPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.school_id) params.append("school_id", String(filters.school_id));
    if (filters?.classroom_id) params.append("classroom_id", String(filters.classroom_id));
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.grade) params.append("grade", String(filters.grade));
    if (filters?.visibility) params.append("visibility", filters.visibility);
    if (filters?.mode) params.append("mode", filters.mode);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const queryString = params.toString();
    const endpoint = queryString ? `/notes?${queryString}` : "/notes";

    return api.get<NotesPaginatedResponse>(endpoint);
  },

  async getNote(id: number): Promise<Note> {
    const response = await api.get<{ data: Note }>(`/notes/${id}`);
    return response.data;
  },

  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await api.post<{ data: Note }>("/notes", data);
    return response.data;
  },

  async updateNote(id: number, data: UpdateNoteData): Promise<Note> {
    const response = await api.put<{ data: Note }>(`/notes/${id}`, data);
    return response.data;
  },

  async deleteNote(id: number): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  async addPermission(noteId: number, data: AddPermissionData): Promise<NotePermission> {
    const response = await api.post<{ data: NotePermission }>(
      `/notes/${noteId}/permissions`,
      data
    );
    return response.data;
  },

  async removePermission(noteId: number, userId: number): Promise<void> {
    await api.delete(`/notes/${noteId}/permissions/${userId}`);
  },
};
