import { api } from "@/lib/api";
import {
  Book,
  BooksPaginatedResponse,
  BooksFilters,
  CreateBookData,
  UpdateBookData,
  UploadImageResponse,
} from "@/types/book";

export const booksService = {
  async getBooks(filters?: BooksFilters): Promise<BooksPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.school_id) params.append("school_id", String(filters.school_id));
    if (filters?.grade) params.append("grade", String(filters.grade));
    if (filters?.track) params.append("track", filters.track);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.isbn) params.append("isbn", filters.isbn);
    if (filters?.min_price !== undefined) params.append("min_price", String(filters.min_price));
    if (filters?.max_price !== undefined) params.append("max_price", String(filters.max_price));
    if (filters?.condition) params.append("condition", filters.condition);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const queryString = params.toString();
    const endpoint = queryString ? `/books?${queryString}` : "/books";

    return api.get<BooksPaginatedResponse>(endpoint);
  },

  async getBook(id: number): Promise<Book> {
    const response = await api.get<{ data: Book }>(`/books/${id}`);
    return response.data;
  },

  async createBook(data: CreateBookData): Promise<Book> {
    const response = await api.post<{ data: Book }>("/books", data);
    return response.data;
  },

  async updateBook(id: number, data: UpdateBookData): Promise<Book> {
    const response = await api.put<{ data: Book }>(`/books/${id}`, data);
    return response.data;
  },

  async deleteBook(id: number): Promise<void> {
    await api.delete(`/books/${id}`);
  },

  async uploadImage(
    bookId: number,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadImageResponse> {
    const token = api.getToken();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("image", file);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data as UploadImageResponse);
          } catch {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(error);
          } catch {
            reject(new Error("Upload failed"));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", `${API_URL}/books/${bookId}/images`);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  },

  async markReserved(id: number): Promise<Book> {
    const response = await api.post<{ data: Book }>(`/books/${id}/mark-reserved`);
    return response.data;
  },

  async markSold(id: number): Promise<Book> {
    const response = await api.post<{ data: Book }>(`/books/${id}/mark-sold`);
    return response.data;
  },
};