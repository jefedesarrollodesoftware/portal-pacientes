import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { SharedService } from '../services/shared.service';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/containers/header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CompanyService } from '../../modules/auth/services/company.service';
import { APP_RUNTIME_CONFIG, AppRuntimeConfig } from '../../app.config';
import { CompanyResponse } from '../../modules/patients/models';


declare var bootstrap: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    SidebarComponent
],
})
export class LayoutComponent implements OnDestroy, OnInit {
  @ViewChild('offcanvasEl') offcanvasEl: ElementRef;
  public mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;
  private bsOffcanvas: any;
  company: CompanyResponse | null = null;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private service: SharedService,
    private companyService: CompanyService,
    @Inject(APP_RUNTIME_CONFIG) private config: AppRuntimeConfig,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 991.98px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
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

  public ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileQueryListener);
    this.bsOffcanvas?.hide();
  }

  public toggleMobileSidebar(): void {
    if (!this.bsOffcanvas && this.offcanvasEl) {
      this.bsOffcanvas = new bootstrap.Offcanvas(this.offcanvasEl.nativeElement);
    }
    this.bsOffcanvas?.toggle();
  }

  public isBlueTheme: boolean = true;
  public isPinkTheme: boolean = false;
  public isGreenTheme: boolean = false;
  public isDarkMode: boolean = false;

  public changeThemeOnBlue(): void {
    this.isBlueTheme = true;
    this.isPinkTheme = false;
    this.isGreenTheme = false;
    this.service.setBlueTheme();
  }
  public changeThemeOnPink(): void {
    this.isBlueTheme = false;
    this.isPinkTheme = true;
    this.isGreenTheme = false;
    this.service.setPinkTheme();
  }
  public changeThemeOnGreen(): void {
    this.isBlueTheme = false;
    this.isPinkTheme = false;
    this.isGreenTheme = true;
    this.service.setGreenTheme();
  }
  public onDarkMode(value: boolean): void {
    this.isDarkMode = value;
    this.service.setDarkMode(value);
  }
}
