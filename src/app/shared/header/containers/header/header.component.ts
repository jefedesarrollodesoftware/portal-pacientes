import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { Users } from '../../../models/users.model';
import { routes } from '../../../../consts';
import { AuthService } from '../../../services/auth.service';
import { UserComponent } from '../../components/user/user.component';
import { CompanyResponse } from '../../../../modules/patients/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, RouterModule, UserComponent],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() company: CompanyResponse | null = null;
  public user$: Observable<Users>;
  public routers: typeof routes = routes;

  get companyName(): string {
    return this.company?.name || 'Portal Pacientes';
  }

  get companyLogo(): string | null {
    return this.company?.logo_url || null;
  }

  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.getCurrentUserInfo();
  }

  public onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  public signOut(): void {
    this.authService.logoutUser();
    this.router.navigate([this.routers.LOGIN]);
  }
}
