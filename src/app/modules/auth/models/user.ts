export interface User {
  id: number;
  person_id: number | null;
  email: string;
  email_verified_at: string | null;
  last_login: string | null;
  inactivated_at: string | null;
  token: string | null;
  profile_photo: string | null;
  theme: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  tipo_documento: string;
  numero_documento: string;
  contraseña: string;
  device_name?: string;
  abilities?: string[];
}

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_at: string | null;
}
