export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: {
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
  };
}

export type PermissionRequirement =
  | string[]
  | { any: string[] }
  | { all: string[] };
