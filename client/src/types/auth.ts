export type UserRole = 'ADMIN' | 'AGENT';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  businessId: string;
  businessName: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  businessName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
