export interface Appointment {
  id: number;
  patient_id: number;
  patient_name?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: string;
  doctor?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentListParams {
  status?: string;
  from?: string;
  to?: string;
  patient_id?: number;
}
