export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SessionData {
  userId: string;
  userAgent?: string;
  ip?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt: Date;
}
