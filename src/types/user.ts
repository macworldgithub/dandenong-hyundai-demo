export type UserRole = 'dealership' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isIllustrative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: User;
}
