import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { SharedService } from '../services/shared.service';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/containers/header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';


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
export class LayoutComponent implements OnDestroy {
  @ViewChild('offcanvasEl') offcanvasEl: ElementRef;
  public mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;
  private bsOffcanvas: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private service: SharedService,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 991.98px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
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
