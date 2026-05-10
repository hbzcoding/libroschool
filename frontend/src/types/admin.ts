import { User } from "./user";
import { Book } from "./book";
import { BookRequest } from "./bookRequest";
import { Note } from "./note";
import { Classroom } from "./classroom";
import { Report } from "./report";
import { School } from "./school";
import { PaginationMeta } from "./api";

// Admin User (extended with ban info)
export interface AdminUser extends User {
  banned_at?: string | null;
  ban_reason?: string | null;
}

// Admin Book (extended)
export interface AdminBook extends Book {
  is_hidden: boolean;
}

// Admin Book Request (extended)
export interface AdminBookRequest extends BookRequest {
  is_hidden: boolean;
}

// Admin Note (extended)
export interface AdminNote extends Note {
  is_hidden: boolean;
}

// Admin Classroom (extended)
export interface AdminClassroom extends Classroom {
  is_locked: boolean;
}

// Admin Report (extended with target info)
export interface AdminReport extends Report {
  target_title?: string;
  resolved_at?: string | null;
  resolved_by?: User | null;
}

// Paginated responses
export interface AdminUsersPaginatedResponse {
  data: AdminUser[];
  meta: PaginationMeta;
}

export interface AdminBooksPaginatedResponse {
  data: AdminBook[];
  meta: PaginationMeta;
}

export interface AdminBookRequestsPaginatedResponse {
  data: AdminBookRequest[];
  meta: PaginationMeta;
}

export interface AdminNotesPaginatedResponse {
  data: AdminNote[];
  meta: PaginationMeta;
}

export interface AdminClassroomsPaginatedResponse {
  data: AdminClassroom[];
  meta: PaginationMeta;
}

export interface AdminReportsPaginatedResponse {
  data: AdminReport[];
  meta: PaginationMeta;
}

export interface AdminSchoolsPaginatedResponse {
  data: School[];
  meta: PaginationMeta;
}

// Filters
export interface AdminUsersFilters {
  search?: string;
  role?: "student" | "admin";
  banned?: boolean;
  school_id?: number;
  page?: number;
  per_page?: number;
}

export interface AdminBooksFilters {
  search?: string;
  status?: "available" | "reserved" | "sold" | "hidden";
  school_id?: number;
  seller_id?: number;
  is_hidden?: boolean;
  page?: number;
  per_page?: number;
}

export interface AdminBookRequestsFilters {
  search?: string;
  status?: "open" | "matched" | "closed" | "hidden";
  school_id?: number;
  buyer_id?: number;
  is_hidden?: boolean;
  page?: number;
  per_page?: number;
}

export interface AdminNotesFilters {
  search?: string;
  visibility?: "private" | "classroom" | "public" | "specific_users";
  school_id?: number;
  author_id?: number;
  is_hidden?: boolean;
  page?: number;
  per_page?: number;
}

export interface AdminClassroomsFilters {
  search?: string;
  status?: "active" | "locked" | "archived";
  school_id?: number;
  is_locked?: boolean;
  page?: number;
  per_page?: number;
}

export interface AdminReportsFilters {
  search?: string;
  status?: "open" | "reviewed" | "dismissed";
  target_type?: "Book" | "BookRequest" | "Note" | "Classroom" | "User";
  page?: number;
  per_page?: number;
}

export interface AdminSchoolsFilters {
  search?: string;
  city?: string;
  province?: string;
  region?: string;
  school_type?: string;
  page?: number;
  per_page?: number;
}

// Action data types
export interface BanUserData {
  reason?: string;
}

export interface CreateSchoolData {
  code: string;
  name: string;
  city: string;
  province: string;
  region: string;
  country: string;
  school_type: string;
}

export interface UpdateSchoolData {
  code?: string;
  name?: string;
  city?: string;
  province?: string;
  region?: string;
  country?: string;
  school_type?: string;
}

// Dashboard stats
export interface AdminDashboardStats {
  users_total: number;
  users_banned: number;
  books_total: number;
  books_hidden: number;
  requests_total: number;
  requests_hidden: number;
  notes_total: number;
  notes_hidden: number;
  classrooms_total: number;
  classrooms_locked: number;
  reports_open: number;
  reports_resolved: number;
  schools_total: number;
}