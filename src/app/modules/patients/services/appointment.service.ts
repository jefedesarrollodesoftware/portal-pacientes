import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, Appointment, AppointmentListParams } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly baseUrl = '/api/v1/appointments';

  constructor(private http: HttpClient) {}

  getMyAppointments(params?: AppointmentListParams): Observable<ApiResponse<Appointment[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.from) httpParams = httpParams.set('from', params.from);
      if (params.to) httpParams = httpParams.set('to', params.to);
    }
    return this.http.get<ApiResponse<Appointment[]>>(this.baseUrl, { params: httpParams });
  }

  getAppointmentById(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.baseUrl}/${id}`);
  }

  getAppointmentsByPatient(patientId: number): Observable<ApiResponse<Appointment[]>> {
    const params = new HttpParams().set('patient_id', patientId.toString());
    return this.http.get<ApiResponse<Appointment[]>>(this.baseUrl, { params });
  }
}
