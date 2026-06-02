import { Component } from '@angular/core';
import { routes } from '../../consts';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class SidebarComponent {
  public routes: typeof routes = routes;

  sidebarItems = [
    { name: 'Dashboard', route: routes.DASHBOARD, icon: 'house' },
    { name: 'Registrar Paciente', route: routes.PATIENTS_REGISTER, icon: 'user-plus' },
    { name: 'Consultar Paciente', route: routes.PATIENTS_LIST, icon: 'magnifying-glass' },
    { name: 'Mis Citas', route: routes.PATIENTS_APPOINTMENTS, icon: 'calendar-days' },
  ];
}
