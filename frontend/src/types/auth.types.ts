export interface User {
  id: number;
  username: string;
  roles: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
