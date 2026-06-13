import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, Appointment, AppointmentListParams, AppointmentListResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly baseUrl = '/api/v1/appointments';
  private appointmentsCache: Appointment[] = [];

  constructor(private http: HttpClient) {}

  setAppointmentsCache(appointments: Appointment[]): void {
    this.appointmentsCache = appointments;
  }

  getAppointmentFromCache(id: number): Appointment | undefined {
    return this.appointmentsCache.find(a => a.idAppointment === id);
  }

  getMyAppointments(params?: AppointmentListParams): Observable<ApiResponse<AppointmentListResponse>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.states) httpParams = httpParams.set('states', params.states);
      if (params.from) httpParams = httpParams.set('from', params.from);
      if (params.to) httpParams = httpParams.set('to', params.to);
    }
    return this.http.get<ApiResponse<AppointmentListResponse>>(this.baseUrl, { params: httpParams });
  }

  getAppointmentById(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.baseUrl}/${id}`);
  }
}
