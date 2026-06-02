import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { Users } from '../../../models/users.model';
import { routes } from '../../../../consts';
import { AuthService } from '../../../services/auth.service';
import { UserComponent } from '../../components/user/user.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, RouterModule, UserComponent],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  public user$: Observable<Users>;
  public routers: typeof routes = routes;

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
