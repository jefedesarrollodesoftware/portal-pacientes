import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../../app.config';

import {
  ApiResponse,
  CreatePatientRequest,
  CreatePatientResponse,
  DisableEnablePatientRequest,
  Patient,
  RegisterPatientRequest,
  RegisterPatientResponse,
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

  register(patient: RegisterPatientRequest): Observable<ApiResponse<RegisterPatientResponse>> {
    const body = { ...patient, company_id: this.config.companyId };
    return this.http.post<ApiResponse<RegisterPatientResponse>>(`${this.baseUrl}/register`, body);
  }

  create(patient: CreatePatientRequest): Observable<ApiResponse<CreatePatientResponse>> {
    return this.http.post<ApiResponse<CreatePatientResponse>>(this.baseUrl, patient);
  }

  getByDocument(docType: string, docNumber: string): Observable<ApiResponse<ShowPatientResponse>> {
    return this.http.get<ApiResponse<ShowPatientResponse>>(`${this.baseUrl}/${docType}/${docNumber}`);
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
}
