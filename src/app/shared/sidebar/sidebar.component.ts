import { Component } from '@angular/core';
import { routes } from '../../consts';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [RouterModule],
})
export class SidebarComponent {
  public routes: typeof routes = routes;

  sidebarItems = [
    { name: 'Dashboard', route: routes.DASHBOARD, icon: 'house' },
    { name: 'Mis Citas', route: routes.PATIENTS_APPOINTMENTS, icon: 'calendar-days' },
  ];
}
