import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../../app.config';

import {
  ApiResponse,
  CheckPatientExistenceRequest,
  CheckPatientExistenceResponse,
  ConfirmRegistrationRequest,
  ConfirmRegistrationResponse,
  CreatePatientRequest,
  CreatePatientResponse,
  DisableEnablePatientRequest,
  InitiateRegistrationResponse,
  Patient,
  RegisterPatientRequest,
  ShowPatientResponse,
  SyncPatientRequest,
  SyncPatientResponse,
  UpdatePasswordRequest,
  UpdatePatientRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly baseUrl = '/api/v1/patients';

  constructor(
    private http: HttpClient,
    @Inject(APP_RUNTIME_CONFIG) private config: AppRuntimeConfig,
  ) {}

  register(patient: RegisterPatientRequest): Observable<ApiResponse<InitiateRegistrationResponse>> {
    const body = { ...patient, company_id: this.config.companyId };
    return this.http.post<ApiResponse<InitiateRegistrationResponse>>(`${this.baseUrl}/register`, body);
  }

  confirmRegistration(data: ConfirmRegistrationRequest): Observable<ApiResponse<ConfirmRegistrationResponse>> {
    return this.http.post<ApiResponse<ConfirmRegistrationResponse>>(`${this.baseUrl}/confirm-registration`, data);
  }

  create(patient: CreatePatientRequest): Observable<ApiResponse<CreatePatientResponse>> {
    const body = { ...patient, company_id: this.config.companyId };
    return this.http.post<ApiResponse<CreatePatientResponse>>(this.baseUrl, body);
  }

  getByDocument(docType: string, docNumber: string, companyId?: number): Observable<ApiResponse<ShowPatientResponse>> {
    let params = new HttpParams();
    const id = companyId ?? this.config.companyId;
    if (id) {
      params = params.set('company_id', id.toString());
    }
    return this.http.get<ApiResponse<ShowPatientResponse>>(`${this.baseUrl}/${docType}/${docNumber}`, { params });
  }

  update(patient: UpdatePatientRequest): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(`${this.baseUrl}/update`, patient);
  }

  updatePassword(data: UpdatePasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/update-password`, data);
  }

  disableEnable(data: DisableEnablePatientRequest): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(`${this.baseUrl}/disable-enable`, data);
  }

  sync(data: SyncPatientRequest): Observable<ApiResponse<SyncPatientResponse>> {
    return this.http.post<ApiResponse<SyncPatientResponse>>(`${this.baseUrl}/sync`, data);
  }

  checkExistence(data: CheckPatientExistenceRequest): Observable<ApiResponse<CheckPatientExistenceResponse>> {
    const body = { ...data, company_id: this.config.companyId };
    return this.http.post<ApiResponse<CheckPatientExistenceResponse>>(`${this.baseUrl}/check-existence`, body);
  }

}
