import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../../app.config';
import { ApiResponse, CompanyResponse } from '../../patients/models';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(
    private http: HttpClient,
    @Inject(APP_RUNTIME_CONFIG) private config: AppRuntimeConfig,
  ) {}

  getCompany(companyId: number): Observable<ApiResponse<CompanyResponse>> {
    return this.http.get<ApiResponse<CompanyResponse>>(`/api/v1/companies/${companyId}`);
  }
}
