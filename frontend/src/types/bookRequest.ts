import { User } from "./user";
import { School } from "./school";
import { PaginationMeta } from "./api";

export type BookRequestStatus = "open" | "matched" | "closed" | "hidden";

export interface BookRequest {
  id: number;
  buyer: User;
  school: School;
  title: string;
  isbn: string | null;
  subject: string | null;
  grade: number | null;
  track: string | null;
  max_price: number | null;
  description: string | null;
  status: BookRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface BookRequestsPaginatedResponse {
  data: BookRequest[];
  meta: PaginationMeta;
}

export interface BookRequestsFilters {
  search?: string;
  school_id?: number;
  grade?: number;
  track?: string;
  subject?: string;
  isbn?: string;
  max_price?: number;
  status?: BookRequestStatus;
  page?: number;
  per_page?: number;
}

export interface CreateBookRequestData {
  school_id: number;
  title: string;
  isbn?: string;
  subject?: string;
  grade?: number | null;
  track?: string | null;
  max_price?: number | null;
  description?: string;
}

export interface UpdateBookRequestData {
  school_id?: number;
  title?: string;
  isbn?: string;
  subject?: string;
  grade?: number | null;
  track?: string | null;
  max_price?: number | null;
  description?: string;
}

export const REQUEST_STATUS_LABELS: Record<BookRequestStatus, string> = {
  open: "Open",
  matched: "Matched",
  closed: "Closed",
  hidden: "Hidden",
};
