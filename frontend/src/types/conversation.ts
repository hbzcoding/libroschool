import { PaginationMeta } from "./api";

export interface ConversationUser {
  id: number;
  name: string;
  email: string;
}

export interface ConversationBook {
  id: number;
  title: string;
  price: number;
}

export interface ConversationBookRequest {
  id: number;
  title: string;
  max_price: number | null;
}

export interface LatestMessage {
  body: string;
  created_at: string;
  sender_id: number;
}

export interface Conversation {
  id: number;
  other_user: ConversationUser;
  book: ConversationBook | null;
  book_request: ConversationBookRequest | null;
  latest_message: LatestMessage | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  body: string;
  created_at: string;
}

export interface ConversationsPaginatedResponse {
  data: Conversation[];
  meta: PaginationMeta;
}

export interface MessagesPaginatedResponse {
  data: Message[];
  meta: PaginationMeta;
}

export interface CreateConversationData {
  recipient_id: number;
  book_id?: number;
  book_request_id?: number;
}

export interface SendMessageData {
  body: string;
}

export interface ConversationsFilters {
  page?: number;
  per_page?: number;
}

export interface MessagesFilters {
  page?: number;
  per_page?: number;
}
