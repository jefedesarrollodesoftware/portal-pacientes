import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, of, take } from 'rxjs';
import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../app.config';
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY, routes } from '../../consts';
import { Users } from '../models/users.model';
import { ApiResponse, RegisterPatientRequest } from '../../modules/patients/models';
import { LoginResponse, User as ApiUser } from '../../modules/auth/models';

export type LoginCredentials = {
  tipo_documento: string;
  numero_documento: string;
  contraseña: string;
  device_name?: string;
  abilities?: string[];
};

export type ChangePasswordPayload = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public config: AppRuntimeConfig;
  public api = '/api/v1/auth';
  public ROUTES: typeof routes = routes;

  constructor(
    @Inject(APP_RUNTIME_CONFIG) appConfig: AppRuntimeConfig,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.config = appConfig;
  }

  private _isFetching = false;
  private _errorMessage = '';

  get isFetching(): boolean {
    return this._isFetching;
  }

  set isFetching(val: boolean) {
    this._isFetching = val;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  set errorMessage(val: string) {
    this._errorMessage = val;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.length > 0) {
        return error.error;
      }

      if (error.error && typeof error.error === 'object') {
        const errObj = error.error as Record<string, unknown>;
        const message = errObj['message'];
        if (typeof message === 'string' && message.length > 0) {
          return message;
        }
      }

      if (typeof error.message === 'string' && error.message.length > 0) {
        return error.message;
      }
    }

    if (error && typeof error === 'object') {
      const maybeAxiosError = error as {
        response?: { data?: unknown };
        message?: unknown;
      };

      if (typeof maybeAxiosError.response?.data === 'string') {
        return maybeAxiosError.response.data;
      }

      if (
        maybeAxiosError.response?.data &&
        typeof maybeAxiosError.response.data === 'object'
      ) {
        const data = maybeAxiosError.response.data as Record<string, unknown>;
        const message = data['message'];
        if (typeof message === 'string' && message.length > 0) {
          return message;
        }
      }

      if (
        typeof maybeAxiosError.message === 'string' &&
        maybeAxiosError.message.length > 0
      ) {
        return maybeAxiosError.message;
      }
    }

    return fallback;
  }

  private toUser(data: Record<string, unknown>): Users {
    return {
      id: typeof data['id'] === 'number' ? String(data['id']) : typeof data['id'] === 'string' ? data['id'] : '',
      firstName: typeof data['first_name'] === 'string' ? data['first_name'] : typeof data['firstName'] === 'string' ? data['firstName'] as string : '',
      lastName: typeof data['last_name'] === 'string' ? data['last_name'] : typeof data['lastName'] === 'string' ? data['lastName'] as string : '',
      phoneNumber: typeof data['cellphone'] === 'string' ? data['cellphone'] : typeof data['phoneNumber'] === 'string' ? data['phoneNumber'] as string : '',
      email: typeof data['email'] === 'string' ? data['email'] : '',
      role: typeof data['role'] === 'string' ? data['role'] : 'user',
      disabled: Boolean(data['inactivated_at'] ?? data['disabled']),
      password: '',
      emailVerified: Boolean(data['email_verified_at'] ?? data['emailVerified']),
      emailVerificationToken: '',
      emailVerificationTokenExpiresAt: null,
      passwordResetToken: '',
      passwordResetTokenExpiresAt: null,
      provider: 'local',
      avatar: [],
      createdBy: null,
      updatedBy: null,
    };
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }

  public loginUser(creds: LoginCredentials): void {
    this.requestLogin();

    const payload = {
      tipo_documento: creds.tipo_documento,
      numero_documento: creds.numero_documento,
      contraseña: creds.contraseña,
      device_name: creds.device_name || 'b2b-client',
      ...(creds.abilities ? { abilities: creds.abilities } : {}),
    };

    this.http
      .post<ApiResponse<LoginResponse>>(`${this.api}/token`, payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.status && res.data?.token) {
            this.receiveToken(res.data, { numero_documento: creds.numero_documento });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loginError(
            this.extractErrorMessage(err, 'Credenciales inválidas. Intenta de nuevo.'),
          );
        },
      });
  }

  public registerUser(payload: RegisterPatientRequest): void {
    this.requestRegister();
    const body = { ...payload, company_id: this.config.companyId };

    this.http
      .post<ApiResponse<unknown>>(`/api/v1/patients/register`, body)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastr.success('Registrado correctamente. Ahora inicia sesión.');
          this.router.navigate([this.ROUTES.LOGIN]);
        },
        error: (err: unknown) => {
          this.registerError(
            this.extractErrorMessage(err, 'Error al registrar. Intenta de nuevo.'),
          );
        },
      });
  }

  public requestRegister(): void {
    this.isFetching = true;
  }

  public receiveRegister(): void {
    this.isFetching = false;
    this.errorMessage = '';
  }

  public registerError(payload: string): void {
    this.isFetching = false;
    this.errorMessage = payload;
  }

  public receiveToken(tokenOrData: string | LoginResponse, userData?: Record<string, unknown>): void {
    const token = typeof tokenOrData === 'string' ? tokenOrData : tokenOrData.token;
    const user = userData || {};
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    this.receiveLogin();
  }

  public logoutUser(): void {
    this.http.delete(`${this.api}/token`).pipe(take(1)).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  public loginError(payload: string): void {
    this.isFetching = false;
    this.errorMessage = payload;
  }

  public receiveLogin(): void {
    this.isFetching = false;
    this.errorMessage = '';
    this.router.navigate([this.ROUTES.DASHBOARD]);
  }

  public requestLogin(): void {
    this.isFetching = true;
  }

  public clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    this.router.navigate([this.ROUTES.LOGIN]);
  }

  public getCurrentUserInfo(): Observable<Users> {
    if (!this.config.isBackend) {
      return of(this.toUser(JSON.parse(localStorage.getItem(AUTH_USER_STORAGE_KEY) || '{}')));
    }

    return this.http
      .get<ApiResponse<ApiUser>>(`${this.api}/me`)
      .pipe(map((res) => this.toUser(res.data as unknown as Record<string, unknown>)));
  }

  public changePassword(
    data: ChangePasswordPayload,
  ): Observable<Record<string, unknown>> {
    if (!this.config.isBackend) {
      return of({ success: true });
    }

    return this.http.post<Record<string, unknown>>(
      `/api/v1/patients/update-password`,
      {
        id_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword,
      },
    );
  }

  public verifyEmail(_token: string): void {
    if (!this.config.isBackend) {
      this.toastr.success("You've been verified your email");
      this.router.navigate([this.ROUTES.LOGIN]);
      return;
    }
  }
}
