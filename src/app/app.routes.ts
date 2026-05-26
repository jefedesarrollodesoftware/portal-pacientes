import { Routes } from '@angular/router';

import { NotFoundComponent } from './shared/not-found/not-found.component';
import { authGuard } from './modules/auth/guards';
import { LayoutComponent } from './shared/layout/layout.component';
import { routes } from './consts';

const ROUTES: typeof routes = routes;

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.DASHBOARD,
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'patients/register',
    loadChildren: () =>
      import('./modules/patients/patients.module').then((m) => m.PatientsModule),
  },
  {
    path: '404',
    component: NotFoundComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        pathMatch: 'full',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./modules/patients/patients.module').then((m) => m.PatientsModule),
      },
      {
        path: 'patients',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./modules/patients/patients.module').then((m) => m.PatientsModule),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
