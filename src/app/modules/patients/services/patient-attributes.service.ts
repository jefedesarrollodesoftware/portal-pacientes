import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, PatientAttribute, PatientAttributesGrouped } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PatientAttributesService {
  private readonly baseUrl = '/api/v1/patient-attributes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<PatientAttributesGrouped>> {
    return this.http.get<ApiResponse<PatientAttributesGrouped>>(this.baseUrl);
  }

  getByType(type: string): Observable<ApiResponse<PatientAttribute[]>> {
    return this.http.get<ApiResponse<PatientAttribute[]>>(`${this.baseUrl}/${type}`);
  }
}
