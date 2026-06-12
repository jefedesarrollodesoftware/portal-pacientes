export interface Appointment {
  idAppointment: number;
  codeTypeDocProfessional: string;
  documentProfessional: string;
  firstGNameProfessional: string;
  secondGNameProfessional: string;
  firstFNameProfessional: string;
  secondFNameProfessional: string;
  dateAppointment: string;
  timeAppointment: string;
  durationAppointment: number;
  idExam: number;
  nameExam: string;
  codeExamType: string;
  nameExamType: string;
  codeOffice: string;
  nameOffice: string;
  codeState: string;
  nameState: string;
  idContract: number;
  codeContract: string;
  nameContract: string;
  idPlan: number;
  codePlan: string;
  namePlan: string;
  hasEHREvent: boolean;
  products: string;
  modality: string;
  idRoom: number;
  codeRoom: string;
  videoLink: string | null;
  identifier: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
}

export interface AppointmentListParams {
  states?: string;
  from?: string;
  to?: string;
}

export interface AppointmentState {
  code: string;
  name: string;
}

export interface AppointmentStatesResponse {
  states: AppointmentState[];
}
