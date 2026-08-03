export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
