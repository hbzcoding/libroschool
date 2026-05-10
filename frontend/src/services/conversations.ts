import { api } from "@/lib/api";
import {
  Conversation,
  ConversationsPaginatedResponse,
  ConversationsFilters,
  CreateConversationData,
  MessagesPaginatedResponse,
  MessagesFilters,
  SendMessageData,
  Message,
} from "@/types/conversation";

export const conversationsService = {
  async getConversations(
    filters?: ConversationsFilters
  ): Promise<ConversationsPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const queryString = params.toString();
    const endpoint = queryString ? `/conversations?${queryString}` : "/conversations";

    return api.get<ConversationsPaginatedResponse>(endpoint);
  },

  async getConversation(id: number): Promise<Conversation> {
    const response = await api.get<{ data: Conversation }>(`/conversations/${id}`);
    return response.data;
  },

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const response = await api.post<{ data: Conversation }>("/conversations", data);
    return response.data;
  },

  async getMessages(
    conversationId: number,
    filters?: MessagesFilters
  ): Promise<MessagesPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const queryString = params.toString();
    const endpoint = queryString
      ? `/conversations/${conversationId}/messages?${queryString}`
      : `/conversations/${conversationId}/messages`;

    return api.get<MessagesPaginatedResponse>(endpoint);
  },

  async sendMessage(conversationId: number, data: SendMessageData): Promise<Message> {
    const response = await api.post<{ data: Message }>(
      `/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },
};