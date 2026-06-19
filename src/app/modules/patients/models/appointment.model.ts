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

export interface CreateAppointmentRequest {
  idSlot: number;
  idExam: number;
  codeExamType: string;
  dateExpected: string;
  codeContract: string;
  codePlan: string;
  codeRegime: string;
  codeTypeAffiliate: string;
  codeLevelAffiliate: string;
  note?: string;
  email?: string;
  cellPhone?: string;
  emailActive?: boolean;
  smsActive?: boolean;
  isForTelemedicine?: boolean;
  products?: string;
}

export interface CreateAppointmentResponse {
  appointment: any;
}

export interface Slot {
  idSlot: number;
  idExam: number;
  nameExam: string;
  startSlot: string;
  timeSlot: string;
  durationSlot: number;
  nameProfessional: string;
  endSlot: string;
  state: string;
  cancelationReason: string;
  schedulerState: string;
  documentProfessional: string;
  nameOffice: string;
  idOffice: number;
  nameRoom: string;
  idRoom: number;
  modality: string;
  qualifier: string;
  products: string;
  isAssignedByProduct: boolean;
  isMaximumAmountControl: boolean;
  available?: boolean;
}

export interface AppointmentSlotsResponse {
  slots: Slot[];
}

export interface CatalogItem {
  code: string;
  name: string;
  value: string;
}

export interface AppointmentCatalogResponse {
  type: string;
  items: any[];
}
