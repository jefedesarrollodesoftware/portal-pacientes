import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, AppointmentStatesResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AppointmentStateService {
  private readonly baseUrl = '/api/v1/appointment-states';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<AppointmentStatesResponse>> {
    return this.http.get<ApiResponse<AppointmentStatesResponse>>(this.baseUrl);
  }
}
