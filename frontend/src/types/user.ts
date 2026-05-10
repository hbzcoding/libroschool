export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin";
  school_id: number | null;
  grade: number | null;
  track: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  school_id?: number | null;
  grade?: number | null;
  track?: string | null;
}