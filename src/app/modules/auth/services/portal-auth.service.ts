import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY, routes } from '../../../consts';

export interface PortalLoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface PortalLoginResponse {
  token: string;
  token_type: string;
  expires_at: string | null;
}

interface ApiResponseWrapper {
  status: boolean;
  message: string;
  data: PortalLoginResponse;
}

@Injectable({
  providedIn: 'root',
})
export class PortalAuthService {
  private readonly loginUrl = '/api/v1/auth/token';
  public readonly ROUTES: typeof routes = routes;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  login(credentials: PortalLoginRequest): Observable<ApiResponseWrapper> {
    const payload: PortalLoginRequest = {
      ...credentials,
      device_name: credentials.device_name || 'b2b-client',
    };

    return this.http.post<ApiResponseWrapper>(this.loginUrl, payload).pipe(
      tap({
        next: (res) => {
          if (res.status && res.data?.token) {
            localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, res.data.token);
            localStorage.setItem(
              AUTH_USER_STORAGE_KEY,
              JSON.stringify({ email: credentials.email }),
            );
            this.toastr.success('Inicio de sesión exitoso.');
            this.router.navigate([this.ROUTES.DASHBOARD]);
          }
        },
        error: () => {
          this.toastr.error('Credenciales inválidas.');
        },
      }),
    );
  }

  logout(): void {
    this.http.delete(this.loginUrl).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  private clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    this.router.navigate([this.ROUTES.LOGIN]);
  }
}
