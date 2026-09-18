export type UserRole = 'controller' | 'ap_clerk' | 'accountant' | 'admin';

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
