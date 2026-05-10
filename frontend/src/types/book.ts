import { User } from "./user";
import { School } from "./school";
import { PaginationMeta } from "./api";

export type BookCondition = "new" | "very_good" | "good" | "acceptable";
export type BookStatus = "available" | "reserved" | "sold" | "hidden";

export interface BookImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface Book {
  id: number;
  seller: User;
  school: School;
  title: string;
  isbn: string | null;
  subject: string | null;
  grade: number | null;
  track: string | null;
  publisher: string | null;
  author: string | null;
  condition: BookCondition;
  price: number;
  description: string | null;
  status: BookStatus;
  images: BookImage[];
  created_at: string;
  updated_at: string;
}

export interface BooksPaginatedResponse {
  data: Book[];
  meta: PaginationMeta;
}

export interface BooksFilters {
  search?: string;
  school_id?: number;
  grade?: number;
  track?: string;
  subject?: string;
  isbn?: string;
  min_price?: number;
  max_price?: number;
  condition?: BookCondition;
  status?: BookStatus;
  page?: number;
  per_page?: number;
}

export interface CreateBookData {
  school_id: number;
  title: string;
  condition: BookCondition;
  price: number;
  isbn?: string;
  subject?: string;
  grade?: number | null;
  track?: string | null;
  publisher?: string;
  author?: string;
  description?: string;
}

export interface UpdateBookData {
  school_id?: number;
  title?: string;
  condition?: BookCondition;
  price?: number;
  status?: BookStatus;
  isbn?: string;
  subject?: string;
  grade?: number | null;
  track?: string | null;
  publisher?: string;
  author?: string;
  description?: string;
}

export interface UploadImageResponse {
  id: number;
  url: string;
  sort_order: number;
}

export const CONDITION_LABELS: Record<BookCondition, string> = {
  new: "New",
  very_good: "Very Good",
  good: "Good",
  acceptable: "Acceptable",
};

export const STATUS_LABELS: Record<BookStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  hidden: "Hidden",
};