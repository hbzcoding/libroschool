import { api } from "@/lib/api";
import {
  Flashcard,
  FlashcardsListResponse,
  CreateFlashcardData,
  UpdateFlashcardData,
  CreateFlashcardsBatchData,
} from "@/types/flashcard";

export const flashcardsService = {
  async getFlashcards(noteId: number): Promise<Flashcard[]> {
    const response = await api.get<FlashcardsListResponse>(
      `/notes/${noteId}/flashcards`
    );
    return response.data;
  },

  async createFlashcard(
    noteId: number,
    data: CreateFlashcardData
  ): Promise<Flashcard> {
    const response = await api.post<{ data: Flashcard }>(
      `/notes/${noteId}/flashcards`,
      data
    );
    return response.data;
  },

  async createFlashcardsBatch(
    noteId: number,
    data: CreateFlashcardsBatchData
  ): Promise<Flashcard[]> {
    const response = await api.post<{ data: Flashcard[] }>(
      `/notes/${noteId}/flashcards`,
      data
    );
    return response.data;
  },

  async updateFlashcard(id: number, data: UpdateFlashcardData): Promise<Flashcard> {
    const response = await api.put<{ data: Flashcard }>(`/flashcards/${id}`, data);
    return response.data;
  },

  async deleteFlashcard(id: number): Promise<void> {
    await api.delete(`/flashcards/${id}`);
  },
};
