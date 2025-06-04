export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  location?: string;
  profilePhoto?: string;
  impactScore: number;
  totalWasteListed: number;
  badges: string[];
  role: 'producer' | 'collector' | 'recycler';
}

export interface AuthData {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  company?: string;
  location?: string;
  role: 'producer' | 'collector' | 'recycler';
}
