export interface Flashcard {
  id: number;
  note_id: number;
  front_text: string;
  back_text: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardsListResponse {
  data: Flashcard[];
}

export interface CreateFlashcardData {
  front_text: string;
  back_text: string;
}

export interface UpdateFlashcardData {
  front_text?: string;
  back_text?: string;
}

export interface CreateFlashcardsBatchData {
  flashcards: CreateFlashcardData[];
}
