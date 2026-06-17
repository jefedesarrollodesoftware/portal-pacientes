import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import {
  ApiResponse,
  PatientAttribute,
  PatientAttributesGrouped,
} from "../models";
import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from "../../../app.config";

@Injectable({
  providedIn: "root",
})
export class PatientAttributesService {
  private readonly baseUrl = "/api/v1/patient-attributes";

  constructor(
    private http: HttpClient,
    @Inject(APP_RUNTIME_CONFIG) private config: AppRuntimeConfig,
  ) {}

  getAll(
    companyId?: number,
  ): Observable<ApiResponse<PatientAttributesGrouped>> {
    let params = new HttpParams();
    const id = companyId ?? this.config.companyId;
    if (id) {
      params = params.set("company_id", id.toString());
    }
    return this.http.get<ApiResponse<PatientAttributesGrouped>>(this.baseUrl, {
      params,
    });
  }

  getByType(
    type: string,
    companyId?: number,
  ): Observable<ApiResponse<PatientAttribute[]>> {
    let params = new HttpParams();
    const id = companyId ?? this.config.companyId;
    if (id) {
      params = params.set("company_id", id.toString());
    }
    return this.http.get<ApiResponse<PatientAttribute[]>>(
      `${this.baseUrl}/${type}`,
      { params },
    );
  }
}
