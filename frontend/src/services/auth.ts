import { api } from "@/lib/api";
import {
  User,
  LoginResponse,
  RegisterData,
  LoginData,
  UpdateProfileData,
} from "@/types/user";

export const authService = {
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/register", data);
    api.setToken(response.token);
    return response;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/login", data);
    api.setToken(response.token);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/logout");
    } finally {
      api.clearToken();
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ data: User }>("/me");
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put<{ data: User }>("/me", data);
    return response.data;
  },

  getToken(): string | null {
    return api.getToken();
  },

  setToken(token: string): void {
    api.setToken(token);
  },

  clearToken(): void {
    api.clearToken();
  },

  isAuthenticated(): boolean {
    return !!api.getToken();
  },
};