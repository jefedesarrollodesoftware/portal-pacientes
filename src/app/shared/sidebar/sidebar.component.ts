import { Component } from '@angular/core';
import { routes } from '../../consts';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    RouterModule,
  ],
})
export class SidebarComponent {
  public routes: typeof routes = routes;

  sidebarItems = [
    { name: 'Dashboard', route: routes.DASHBOARD, icon: 'home' },
    { name: 'Registrar Paciente', route: routes.PATIENTS_REGISTER, icon: 'person_add' },
    { name: 'Consultar Paciente', route: routes.PATIENTS_LIST, icon: 'search' },
    { name: 'Mis Citas', route: routes.PATIENTS_APPOINTMENTS, icon: 'calendar_today' },
  ];
}
