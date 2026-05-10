import { User } from "./user";
import { School } from "./school";
import { Classroom } from "./classroom";
import { PaginationMeta } from "./api";

export type NoteVisibility = "private" | "classroom" | "public" | "specific_users";
export type NoteMode = "note" | "flashcard";

export interface NotePermission {
  id: number;
  user: User;
  created_at: string;
}

export interface Note {
  id: number;
  author: User;
  school: School | null;
  classroom: Classroom | null;
  title: string;
  content: string;
  subject: string | null;
  grade: number | null;
  visibility: NoteVisibility;
  mode: NoteMode;
  permissions: NotePermission[];
  created_at: string;
  updated_at: string;
}

export interface NotesPaginatedResponse {
  data: Note[];
  meta: PaginationMeta;
}

export interface NotesFilters {
  search?: string;
  school_id?: number;
  classroom_id?: number;
  subject?: string;
  grade?: number;
  visibility?: NoteVisibility;
  mode?: NoteMode;
  page?: number;
  per_page?: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
  school_id?: number;
  classroom_id?: number;
  subject?: string;
  grade?: number | null;
  visibility?: NoteVisibility;
  mode?: NoteMode;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  school_id?: number;
  classroom_id?: number | null;
  subject?: string;
  grade?: number | null;
  visibility?: NoteVisibility;
  mode?: NoteMode;
}

export interface AddPermissionData {
  user_id: number;
}

export const VISIBILITY_LABELS: Record<NoteVisibility, string> = {
  private: "Private",
  classroom: "Classroom",
  public: "Public",
  specific_users: "Specific Users",
};

export const MODE_LABELS: Record<NoteMode, string> = {
  note: "Note",
  flashcard: "Flashcard",
};

export const VISIBILITY_DESCRIPTIONS: Record<NoteVisibility, string> = {
  private: "Only you can see this note",
  classroom: "Members of your classroom can see this note",
  public: "Anyone can see this note",
  specific_users: "Only selected users can see this note",
};
