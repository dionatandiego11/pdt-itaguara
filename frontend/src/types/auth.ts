export interface User {
  id: number
  username: string
  email: string
  full_name?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  level: string | number
  is_verified: boolean
  is_active: boolean
  is_superuser: boolean
  reputation_score: number
  contributions_count: number
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  full_name: string
}
