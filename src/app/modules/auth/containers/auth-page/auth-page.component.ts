
import { Component, DestroyRef, Inject, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService, LoginCredentials } from '../../../../shared/services/auth.service';
import { CompanyService } from '../../services/company.service';
import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../../../app.config';
import { CompanyResponse } from '../../../patients/models';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { SignFormComponent } from '../../components/sign-form/sign-form.component';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
  standalone: true,
  imports: [RouterModule, LoginFormComponent, SignFormComponent],
})
export class AuthPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  public activeTab: 'login' | 'register' = 'login';
  public company: CompanyResponse | null = null;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    @Inject(APP_RUNTIME_CONFIG) private config: AppRuntimeConfig,
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

  ngOnInit(): void {
    this.loadCompany();
  }

  private loadCompany(): void {
    this.companyService.getCompany(this.config.companyId).subscribe({
      next: (res) => {
        this.company = res.data;
        this.applyTheme(res.data);
      },
      error: () => {},
    });
  }

  private applyTheme(company: CompanyResponse): void {
    const root = document.documentElement;
    if (company.primary_color) {
      root.style.setProperty('--primary-color', company.primary_color);
    }
    if (company.secondary_color) {
      root.style.setProperty('--secondary-color', company.secondary_color);
    }
    if (company.icon_url) {
      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = company.icon_url;
    }
  }

  public sendLoginForm(creds: LoginCredentials): void {
    this.authService.loginUser(creds);
  }

  public openTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
  }
}
