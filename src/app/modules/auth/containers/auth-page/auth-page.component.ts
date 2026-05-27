import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { routes } from '../../../../consts';
import {
  AuthService,
  LoginCredentials,
} from '../../../../shared/services/auth.service';
import { RegisterPatientRequest } from '../../../patients/models';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { SignFormComponent } from '../../components/sign-form/sign-form.component';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
  standalone: true,
  imports: [RouterModule, MatTabsModule, MatButtonModule, MatIconModule, LoginFormComponent, SignFormComponent],
})
export class AuthPageComponent {
  public routers: typeof routes = routes;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    if (this.authService.isAuthenticated()) {
      this.authService.receiveLogin();
    }

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: Params) => {
        const token = params['token'];
        if (token) {
          this.authService.receiveToken(String(token));
        }
      });
  }

  public sendLoginForm(creds: LoginCredentials): void {
    this.authService.loginUser(creds);
  }

  public sendSignForm(creds: RegisterPatientRequest): void {
    this.authService.registerUser(creds);
  }
}
