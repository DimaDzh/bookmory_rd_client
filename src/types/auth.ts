export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: string | number;
  expires_at: string;
  user: User;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}
