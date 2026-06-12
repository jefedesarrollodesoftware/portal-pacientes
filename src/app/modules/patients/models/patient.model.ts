export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface Patient {
  id: number;
  company_id: number | null;
  document_type_id: number | null;
  document_number: string;
  document_expedition_date: string | null;
  first_name: string;
  last_name: string;
  date_birth: string | null;
  gender_id: number | null;
  gender_identity_id: number | null;
  civil_status_id: number | null;
  scholarship_id: number | null;
  email: string;
  cellphone_code: string | null;
  cellphone: string;
  address: string | null;
  source: string;
  external_reference: string | null;
  active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountState {
  active: boolean;
  password_set: boolean;
}

export interface PatientAttribute {
  id: number;
  code: string;
  name: string;
  short: string | null;
  value: string | null;
  description: string | null;
  order: number | null;
  icon: string | null;
}

export type PatientAttributesGrouped = Record<string, PatientAttribute[]>;

export interface RegisterPatientRequest {
  document_type_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  password: string;
  password_confirmation: string;
  cellphone_code?: string;
  document_expedition_date?: string;
  date_birth?: string;
  gender_id?: number;
  gender_identity_id?: number;
  civil_status_id?: number;
  scholarship_id?: number;
  address?: string;
  company_id?: number;
}

export interface InitiateRegistrationResponse {
  session_token: string;
  expires_at: string;
  channels: {
    email: boolean;
    cellphone: boolean;
  };
}

export interface ConfirmRegistrationRequest {
  session_token: string;
  code: string;
}

export interface ConfirmRegistrationResponse {
  patient: Patient;
  account_state: AccountState;
  source: string;
}

export interface CreatePatientRequest {
  document_type_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  cellphone_code?: string;
  company_id?: number;
  document_expedition_date?: string;
  date_birth?: string;
  gender_id?: number;
  gender_identity_id?: number;
  civil_status_id?: number;
  scholarship_id?: number;
  address?: string;
  password?: string;
  password_confirmation?: string;
}

export interface CreatePatientResponse {
  patient: Patient;
  access_created: boolean;
  temp_password_sent: boolean;
  source: string;
}

export interface UpdatePatientRequest {
  id: number;
  document_type_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  cellphone_code?: string;
  document_expedition_date?: string;
  date_birth?: string;
  gender_id?: number;
  gender_identity_id?: number;
  civil_status_id?: number;
  scholarship_id?: number;
  address?: string;
}

export interface UpdatePasswordRequest {
  id_password: number;
  new_password: string;
  new_password_confirmation: string;
}

export interface DisableEnablePatientRequest {
  id: number;
  active: boolean;
}

export interface SyncPatientRequest {
  keyWS: string;
  document_type_id: number;
  documentPatient: string;
}

export interface SyncPatientResponse {
  patient: Patient;
  synced: boolean;
  created_or_updated: 'created' | 'updated';
  source: string;
}

export interface ShowPatientResponse {
  patient: Patient;
  account_state: AccountState;
}

export interface CheckPatientExistenceRequest {
  document_type_id: number;
  document_number: string;
  company_id?: number;
}

export interface CheckPatientExistenceResponse {
  exists: boolean;
  patient: Patient | null;
}

export interface CompanyResponse {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  icon_url: string | null;
  logo: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  active: boolean;
}
